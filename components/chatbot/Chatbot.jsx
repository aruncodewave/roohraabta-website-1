"use client";

import React, { useState, useRef, useEffect } from 'react';
import './chatbot.css';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { validatePhoneNumber } from '@/lib/vfe/otp';
import { toast } from 'react-toastify';
import { getAiApiUrl, getVfeApiUrl, PLATFORM_NAME as defaultPlatformName } from '@/lib/vfe/config';
import QuestionSelect from './QuestionSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import './inputfield.css';
import { fetchCountryCodes } from '@/lib/vfe/api';
import { parseE164Mobile } from '@/lib/vfe/phone';

const capitalizeFirst = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '');
import ChatbotHeader from './ChatbotHeader';
import ChatbotLeadForm from './ChatbotLeadForm';
import ChatbotCallStatus from './ChatbotCallStatus';
import ChatbotMessages from './ChatbotMessages';
import ChatbotInitialOptions from './ChatbotInitialOptions';
import ChatbotVoiceAgentPanel from './ChatbotVoiceAgentPanel';
import { useVoiceAgentSession } from './useVoiceAgentSession';

const Chatbot = () => {
  const API_BASE_URL = getAiApiUrl();
  const VFE_API_URL = getVfeApiUrl();
  const LEAD_API_URL = `${VFE_API_URL}/api/lead-capture`;
  const STORAGE_KEY = 'vfe_chatbot_state_v2';
  
  const [isOpen, setIsOpen] = useState(false);
  const [chatPhase, setChatPhase] = useState('initial'); // 'initial', 'leadForm', 'chatting', 'completed', 'callForm', 'voiceAgent'
  const [leadId, setLeadId] = useState(null);
  const [isChatStarted, setIsChatStarted] = useState();
  const [isChatCompleted, setIsChatCompleted] = useState();
  const [isFirstQuestionCall, setIsFirstQuestionCall] = useState(false); // Track if this is the first next-question call
  // const [isComplete, setIsComplete] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [callStatus, setCallStatus] = useState(null); // 'initiating', 'calling', 'completed', 'failed'
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  
  // Lead form states
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    phoneNumber: '',
    verificationId: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  
  // OTP states
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Validation error states
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneOtp: ''
  });
  
  const handlePhoneVerificationStatus = (status) => {
    setPhoneVerified(status);
    setValidationErrors((prev) => ({
      ...prev,
      phoneOtp: status ? '' : prev.phoneOtp,
    }));
  };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const multiSelectTimeoutRef = useRef(null);
  const hasCreatedCompletionDuplicateLeadRef = useRef(false);
  
  // Onboarding question states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  const {
    voiceAgentMode,
    voiceAgentError,
    startVoiceAgentSession,
    stopVoiceAgentSession,
    resetVoiceAgentSession,
  } = useVoiceAgentSession({
    apiBaseUrl: API_BASE_URL,
    leadId,
    isChatbotOpen: isOpen,
  });

  const isNumericAgeQuestion =
    currentQuestion &&
    currentQuestion.question_id === 'age' &&
    currentQuestion.input_pattern === '[0-9]*';

  // Detect if content is likely HTML
  const isHtmlContent = (text) => {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    // Basic tag presence check
    return /<\s*\w+[^>]*>/.test(trimmed) && /<\s*\/\s*\w+\s*>/.test(trimmed);
  };

  // Convert URLs, emails, and phone numbers to clickable links
  const makeLinksClickable = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let processedText = text;
    
    // Convert URLs to markdown links (https:// or http://)
    processedText = processedText.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `[${url}](${url})`
    );
    
    // Convert email addresses to mailto: links
    processedText = processedText.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      (email) => `[${email}](mailto:${email})`
    );
    
    // Convert phone numbers to tel: links (supports formats like +91 9999999999, +91 99999 99999, +91-9999999999, etc.)
    // Match phone numbers with country code and spaces/dashes anywhere in the number
    // Pattern: + followed by country code (1-4 digits), then digits with optional spaces/dashes between them
    processedText = processedText.replace(
      /(\+\d{1,4}(?:[\s-]*\d)+)/g,
      (phone) => {
        // Clean phone number for tel: link (remove spaces and dashes)
        const cleanPhone = phone.replace(/[\s-]/g, '');
        // Only convert if it looks like a valid phone number (at least 7 digits total, max 15)
        const digitsOnly = cleanPhone.replace(/\D/g, '');
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          // Use markdown format but ensure tel: protocol is explicit
          return `[${phone}](tel:${cleanPhone})`;
        }
        return phone;
      }
    );
    
    return processedText;
  };

  // Render message content with proper link handling
  const renderMessageContent = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    if (isHtmlContent(text)) {
      return parse(DOMPurify.sanitize(text));
    }
    
    // Convert escaped newlines (\\n) to actual newlines with double newlines for proper paragraph breaks in Markdown
    // This handles cases where the API returns text like "Line 1\\nLine 2"
    let processedText = text.replace(/\\n/g, '\n\n');
    
    // Process the text to make links clickable
    processedText = makeLinksClickable(processedText);
    
    return (
      <ReactMarkdown
        components={{
          a: ({ node, href, children, ...props }) => {
            // Handle tel: and mailto: links with proper event handling
            let linkHref = href;
            
            // Check if this is a tel: link (by checking if href starts with tel: or if children contain a phone number)
            const childrenText = typeof children === 'string' ? children : children?.toString() || '';
            const phonePattern = /(\+\d{1,4}(?:[\s-]*\d)+)/;
            const hasPhoneNumber = phonePattern.test(childrenText);
            
            if (href?.startsWith('tel:') || (hasPhoneNumber && !href?.startsWith('http'))) {
              // If href already starts with tel:, use it
              // Otherwise, extract phone number from children and create tel: link
              if (!href.startsWith('tel:')) {
                const phoneMatch = childrenText.match(phonePattern);
                if (phoneMatch) {
                  const cleanPhone = phoneMatch[1].replace(/[\s-]/g, '');
                  linkHref = `tel:${cleanPhone}`;
                } else {
                  // Fallback: try to extract from href
                  const hrefPhoneMatch = href.match(/(\+?\d+)/);
                  if (hrefPhoneMatch) {
                    linkHref = `tel:${hrefPhoneMatch[1]}`;
                  }
                }
              }
              
              return (
                <a
                  href={linkHref}
                  onClick={(e) => {
                    // Stop propagation to prevent any parent handlers
                    e.stopPropagation();
                    // Don't prevent default - let browser handle tel: naturally
                  }}
                  onMouseDown={(e) => {
                    // Prevent any form submission or page refresh
                    e.stopPropagation();
                  }}
                  style={{ cursor: 'pointer' }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            
            // Handle mailto: links
            if (href?.startsWith('mailto:')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ cursor: 'pointer' }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            // For regular http/https links, open in new tab
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ node, children, ...props }) => {
            // Custom paragraph component to ensure proper spacing
            return <p style={{ marginBottom: '0.5em' }} {...props}>{children}</p>;
          },
        }}
      >
        {processedText}
      </ReactMarkdown>
    );
  };

  // Format time consistently for both server and client
  const formatTime = (date) => {
    if (!isClient) {
      // Return a placeholder during SSR to avoid hydration mismatch
      return '--:--';
    }
    
    // Handle both Date objects and string timestamps from localStorage
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return '--:--';
    }
    
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Save state to localStorage
  const saveState = (state) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save chatbot state:', error);
      }
    }
  };

  // Load state from localStorage
  const loadState = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load chatbot state:', error);
        return null;
      }
    }
    return null;
  };

  // Clear state from localStorage
  const clearState = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear chatbot state:', error);
      }
    }
  };

  // Fetch country options
  const fetchCountryOptions = async () => {
    try {
      const countryCodes = await fetchCountryCodes();
      const options = Array.isArray(countryCodes) ? countryCodes : [];
      if (options.length > 0) {
        setCountryOptions(options);
        return;
      }
      setCountryOptions([]);
    } catch (error) {
      console.error('Failed to fetch country options:', error);
      setCountryOptions([
        { value: '+91', label: 'India (+91)' },
        { value: '+1', label: 'United States (+1)' },
        { value: '+44', label: 'United Kingdom (+44)' },
        { value: '+61', label: 'Australia (+61)' }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsClient(true);
    const savedState = loadState();
    if (savedState) {
      const restoredPhase = savedState.chatPhase || 'initial';
      setChatPhase(restoredPhase);
      setLeadId(savedState.leadId || null);
      setIsChatStarted(savedState.isChatStarted);
      setIsChatCompleted(savedState.isChatCompleted);
      setIsFirstQuestionCall(savedState.isFirstQuestionCall || false);
      // setIsComplete(savedState.isComplete || false);
      setCallStatus(savedState.callStatus || null);
      setIsInitiatingCall(savedState.isInitiatingCall || false);
      
      // Convert timestamp strings back to Date objects for messages
      const restoredMessages = (savedState.messages || []).map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));
      setMessages(restoredMessages);
      
      setLeadForm(savedState.leadForm || {
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        phoneNumber: ''
      });

      // Restore question state
      if (savedState.currentQuestion) {
        setCurrentQuestion(savedState.currentQuestion);
      }
      setSelectedAnswer(savedState.selectedAnswer || '');
      setSelectedAnswers(savedState.selectedAnswers || []);
    }
  }, []);

  useEffect(() => {
    if (isOpen && countryOptions.length === 0) {
      fetchCountryOptions();
    }
  }, [isOpen, countryOptions.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isClient || typeof document === 'undefined') return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isClient]);

  // Save state whenever important state changes
  useEffect(() => {
    if (isClient) {
      const stateToSave = {
        chatPhase,
        leadId,
        isChatStarted,
        isChatCompleted,
        isFirstQuestionCall,
        // isComplete,
        callStatus,
        isInitiatingCall,
        messages,
        leadForm,
        currentQuestion,
        selectedAnswer,
        selectedAnswers
      };
      saveState(stateToSave);
    }
  }, [chatPhase, leadId, isChatStarted, isChatCompleted, isFirstQuestionCall, callStatus, isInitiatingCall, messages, leadForm, currentQuestion, selectedAnswer, selectedAnswers, isClient]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const resetChatbot = () => {
    // Clear any pending timeouts
    if (multiSelectTimeoutRef.current) {
      clearTimeout(multiSelectTimeoutRef.current);
      multiSelectTimeoutRef.current = null;
    }

    resetVoiceAgentSession();
    
    setChatPhase('initial');
    setMessages([]);
    setLeadId(null);
    setIsChatStarted(undefined);
    setIsChatCompleted(undefined);
    setIsFirstQuestionCall(false);
    // setIsComplete(false);
    setCallStatus(null);
    setIsInitiatingCall(false);
    setLeadForm({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      phoneNumber: '',
      verificationId: ''
    });
    setValidationErrors({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      phoneOtp: ''
    });
    setPhoneVerified(false);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setSelectedAnswers([]);
    setSelectedDate('');
    setDateError('');
    setInputValue('');
    clearState();
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetChatbot();
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleBack = () => {
    if (chatPhase === 'leadForm' || chatPhase === 'callForm') {
      // setIsOpen(false);
      setChatPhase('initial');
    } else if (chatPhase === 'initial') {
      setIsOpen(false);
    }
  };

  const handleLeadFormChange = (field, value) => {
    let processedValue = value;
    
    // Apply character-only validation for name fields
    if (field === 'firstName' || field === 'lastName') {
      // Allow alphabetic characters and spaces, clean up multiple spaces
      processedValue = value.replace(/[^a-zA-Z\s]/g, ''); // Remove non-alphabetic and non-space characters
      processedValue = processedValue.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    }
    
    // Apply space restriction for email
    if (field === 'email') {
      // Remove all spaces from email
      processedValue = value.replace(/\s/g, '');
    }
    
    setLeadForm(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear validation error when user starts typing
    setValidationErrors(prev => {
      const updatedErrors = { ...prev };
      if (updatedErrors[field]) {
        updatedErrors[field] = '';
      }
      if ((field === 'phoneNumber' || field === 'countryCode') && updatedErrors.phoneOtp) {
        updatedErrors.phoneOtp = '';
      }
      return updatedErrors;
    });

    if (field === 'phoneNumber' || field === 'countryCode') {
      if (phoneVerified) {
        setPhoneVerified(false);
      }
    }
  };

  const handlePhoneVerificationIdChange = (verificationId) => {
    setLeadForm(prev => ({
      ...prev,
      verificationId: verificationId || ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // First Name validation
    if (!leadForm.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (leadForm.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(leadForm.firstName.trim())) {
      errors.firstName = 'First name can only contain letters and single spaces';
      isValid = false;
    }
    
    // Last Name validation
    if (!leadForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (leadForm.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(leadForm.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters and single spaces';
      isValid = false;
    }
    
    // Email validation
    if (!leadForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leadForm.email.trim())) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      } else if (leadForm.email.includes(' ')) {
        errors.email = 'Email cannot contain spaces';
        isValid = false;
      }
    }
    
    // Phone Number validation
    if (!leadForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else {
      if (!validatePhoneNumber(leadForm.phoneNumber.trim())) {
        errors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
        isValid = false;
      }
    }
    
    if (!leadForm.countryCode) {
      errors.phoneNumber = errors.phoneNumber || 'Country code is required';
      isValid = false;
    }

    if (!errors.phoneNumber && !phoneVerified) {
      errors.phoneOtp = 'Please verify your phone number with OTP';
      isValid = false;
    } else if (errors.phoneNumber) {
      errors.phoneOtp = '';
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  // Handle keydown for name fields (characters only)
  const handleNameKeyDown = (e) => {
    // Allow only alphabetic characters, space, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', ' '];
    const isLetter = /^[a-zA-Z]$/.test(e.key);
    const isSpace = e.key === ' ';
    
    // Allow letters, spaces, and navigation keys
    if (!isLetter && !isSpace && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handle keydown for email field (no spaces)
  const handleEmailKeyDown = (e) => {
    // Prevent space key from being entered
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmittingLead(true);

    try {
      const response = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: leadForm.firstName,
          last_name: leadForm.lastName,
          email_id: leadForm.email,
          country_code: leadForm.countryCode,
          phone_number: leadForm.phoneNumber,
          verificationId: leadForm.verificationId,
          utm_source: "AI_CHAT_BOT",
          platform_name: defaultPlatformName,
          lead_source: 'AI_CHAT_BOT'
        })
      });

      console.log(response?.body, 'asdkljf')

      const data = await response.json();

      if (!response.ok) {
        // Create error with response data
        const error = new Error(`Lead capture API failed with status: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      console.log(data, 'ajsdl')

      if (!data.success) {
        throw new Error(data?.message || 'Failed to create lead');
      }

      const leadData = data.data || {};
      const newLeadId = leadData.leadId || leadData.lead_id || null;
      const isChatStarted = leadData.isChatBotInitiated;
      const isChatCompleted = leadData.isCompletedChatBot;

      console.log('isChatStarted', isChatStarted);
      console.log('isChatCompleted', isChatCompleted);
      setIsChatStarted(isChatStarted);
      setIsChatCompleted(isChatCompleted);

      // A successful capture can omit leadId. Chat and voice still need that id.
      if (newLeadId) {
        setLeadId(newLeadId);
        console.log('Lead created successfully with ID:', newLeadId);

        if (chatPhase === 'leadForm') {
          setChatPhase('chatting');
          await fetchNextQuestion(newLeadId, isChatStarted, isChatCompleted, true);
        } else if (chatPhase === 'callForm') {
          setChatPhase('voiceAgent');
        }
      } else {
        const successMessage =
          data.message ||
          'Thank you! Your form has been submitted successfully. We will contact you soon.';
        toast.success(successMessage);
        setChatPhase('completed');
        setMessages([
          {
            id: Date.now(),
            text: successMessage,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating lead:', error);

      if (error.status && error.data) {
        const responseData = error.data;
        const isOtpVerificationExpired =
          error.status === 403 &&
          responseData?.data?.requiresOTPVerification === true &&
          responseData?.data?.mobile &&
          countryOptions.length > 0;
        if (isOtpVerificationExpired) {
          const parsed = parseE164Mobile(responseData.data.mobile, countryOptions);
          if (parsed) {
            setLeadForm((prev) => ({
              ...prev,
              countryCode: parsed.countryCode,
              phoneNumber: parsed.phone,
            }));
            setPhoneVerified(false);
            toast.info(
              responseData?.message ||
                'Mobile verification has expired. Please verify your mobile number again and resubmit.'
            );
            setIsSubmittingLead(false);
            return;
          }
        }
        if (error.status === 409) {
          // Conflict - likely duplicate entry
          toast.error(
            error.data?.message || "This email or phone number is already registered. Please use different details or contact support."
          );
        } else if (error.data?.details && Array.isArray(error.data.details)) {
          // Show detailed validation errors
          error.data.details.forEach(detail => {
            toast.error(detail);
          });
        } else {
          // Show general error message
          toast.error(
            error.data?.message || "Failed to submit form. Please try again."
          );
        }
      } else if (error.response?.data) {
        // Handle axios-style errors (if any)
        if (error.response.data.details && Array.isArray(error.response.data.details)) {
          error.response.data.details.forEach(detail => {
            toast.error(detail);
          });
        } else {
          toast.error(
            error.response.data?.message || "Failed to submit form. Please try again."
          );
        }
      } else {
        // Handle generic errors
        toast.error(
          error.message || "Failed to submit form. Please try again."
        );
      }
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Normalize options format - handle both string arrays and object arrays
  const normalizeOptions = (options) => {
    if (!options || !Array.isArray(options)) {
      return [];
    }
    
    // If options are strings, convert them to objects
    if (options.length > 0 && typeof options[0] === 'string') {
      return options.map((option, index) => ({
        id: option,
        value: option,
        label: option
      }));
    }
    
    // If options are already objects, ensure they have required fields
    return options.map((option, index) => {
      if (typeof option === 'string') {
        return {
          id: option,
          value: option,
          label: option
        };
      }
      // If it's an object, use it as is (should have id, value, label)
      return option;
    });
  };

  // Fetch next question from onboarding API
  const fetchNextQuestion = async (leadIdParam = null, chatStarted = null, chatCompleted = null, includeFlags = false) => {
    const currentLeadId = leadIdParam || leadId;
    if (!currentLeadId) return;

    setIsLoadingQuestion(true);
    
    // Use passed parameters or fall back to state
    const isStarted = chatStarted !== null ? chatStarted : isChatStarted;
    const isCompleted = chatCompleted !== null ? chatCompleted : isChatCompleted;
    
    // Maximum iterations to prevent infinite loops
    const MAX_ITERATIONS = 10;
    let iterations = 0;
    let shouldIncludeFlags = includeFlags; // Track if we should include flags (only first iteration)
    
    try {
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        
        // Prepare payload - conditionally include flags only on first iteration
        const payload = {
          lead_id: currentLeadId
        };
        
        // Only add is_chat_started and is_chat_completed on the very first API call
        if (shouldIncludeFlags) {
          payload.is_chat_started = isStarted;
          payload.is_chat_completed = isCompleted;
          shouldIncludeFlags = false; // Set to false after first iteration
        }
        
        const response = await fetch(`${API_BASE_URL}/onboarding/next-question`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Next question API failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.is_complete) {
          // Onboarding is complete
          setCurrentQuestion(null);
          
          // Add the completion message from API if available, otherwise use default
          const completeMessage = {
            id: Date.now(),
            text: data.question_text || "Thank you for providing your information! We'll be in touch soon.",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completeMessage]);
          
          // Call save-answer API with answer as null for the completion message
          if (data.question_id && currentLeadId) {
            try {
              const saveResponse = await fetch(`${API_BASE_URL}/onboarding/save-answer`, {
                method: 'POST',
                headers: {
                  'accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  lead_id: currentLeadId,
                  question_id: data.question_id,
                  answer: null
                })
              });

              if (!saveResponse.ok) {
                console.error(`Save answer API failed with status: ${saveResponse.status}`);
                // Continue anyway, don't block the flow
              } else {
                const saveData = await saveResponse.json();
                if (saveData.status !== 'success') {
                  console.error('Failed to save completion answer:', saveData.message);
                }
              }
            } catch (saveError) {
              console.error('Error saving completion answer:', saveError);
              // Continue anyway, don't block the flow
            }
          }
          
          break; // Exit the loop
        } else if (data.answer_type === 'transition_message') {
          // If answer_type is transition_message, show the message and continue to fetch next question
          if (data.question_text) {
            const transitionMessage = {
              id: Date.now(),
              text: data.question_text,
              sender: 'bot',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, transitionMessage]);
          }
          setCurrentQuestion(null);
          
          // Call save-answer API with answer as null for transition_message
          if (data.question_id && currentLeadId) {
            try {
              const saveResponse = await fetch(`${API_BASE_URL}/onboarding/save-answer`, {
                method: 'POST',
                headers: {
                  'accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  lead_id: currentLeadId,
                  question_id: data.question_id,
                  answer: null
                })
              });

              if (!saveResponse.ok) {
                console.error(`Save answer API failed with status: ${saveResponse.status}`);
                // Continue anyway, don't block the flow
              } else {
                const saveData = await saveResponse.json();
                if (saveData.status !== 'success') {
                  console.error('Failed to save transition message answer:', saveData.message);
                }
              }
            } catch (saveError) {
              console.error('Error saving transition message answer:', saveError);
              // Continue anyway, don't block the flow
            }
          }
          
          // Continue the loop to fetch the next question
          // Add a small delay to prevent rapid-fire requests
          await new Promise(resolve => setTimeout(resolve, 100));
          continue; // Continue to next iteration
        } else if (!data.answer_type || data.answer_type === null) {
          // If answer_type is null, just show the message without input
          const messageOnly = {
            id: Date.now(),
            text: data.question_text || '',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, messageOnly]);
          setCurrentQuestion(null);
          break; // Exit the loop
        } else {
          // Normalize options before setting current question
          const normalizedData = {
            ...data,
            options: normalizeOptions(data.options)
          };
          
          // First, add the question as a bot message
          const questionMessage = {
            id: Date.now(),
            text: normalizedData.question_text,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, questionMessage]);
          
          // Then set current question for input - this will trigger the UI to show the input field
          setCurrentQuestion(normalizedData);
          setSelectedAnswer('');
          setSelectedAnswers([]);
          setSelectedDate('');
          setDateError('');
          setInputValue('');
          
          // Scroll to bottom to show the new question
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          break; // Exit the loop
        }
      }
      
      // If we hit max iterations, log a warning
      if (iterations >= MAX_ITERATIONS) {
        console.warn('Maximum iterations reached while fetching questions. Possible infinite loop detected.');
        toast.error('An error occurred while loading questions. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching next question:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to load question. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Validate date - must be at least 18 years old
  const validateDate = (dateString) => {
    if (!dateString) {
      setDateError('Please select a date');
      return false;
    }

    try {
      const selectedDate = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
      const today = new Date();
      
      // Check if date is valid
      if (isNaN(selectedDate.getTime())) {
        setDateError('Please enter a valid date');
        return false;
      }

      const age = today.getFullYear() - selectedDate.getFullYear();
      const monthDiff = today.getMonth() - selectedDate.getMonth();
      const dayDiff = today.getDate() - selectedDate.getDate();

      // Calculate actual age
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }

      if (actualAge < 18) {
        setDateError('Age must be at least 18 years');
        return false;
      }

      if (actualAge > 120) {
        setDateError('Please enter a valid date');
        return false;
      }

      setDateError('');
      return true;
    } catch (error) {
      setDateError('Please enter a valid date');
      return false;
    }
  };

  // Get maximum date (18 years ago from today) - returns Date object for DatePicker
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate;
  };

  // Get minimum date (reasonable minimum, e.g., 120 years ago) - returns Date object for DatePicker
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return minDate;
  };

  // Save answer to onboarding API
  const saveAnswer = async (answerValue) => {
    if (!leadId || !currentQuestion) return;

    setIsSavingAnswer(true);
    try {
      const isCompletedSpokeWithTeamQuestion =
        currentQuestion.question_id != null &&
        String(currentQuestion.question_id).trim().toLowerCase() === 'completed_spoke_with_team';
      const shouldCreateDuplicateLead =
        !hasCreatedCompletionDuplicateLeadRef.current &&
        isCompletedSpokeWithTeamQuestion;

        console.log(shouldCreateDuplicateLead, 'shouldCreateDuplicateLead')

      // For multi-select, send array of IDs; for single-select and text, send single value
      // For date, send the selected date (use the parameter if provided, otherwise use state)
      let answer;
      if (currentQuestion.answer_type === 'multi_select') {
        answer = selectedAnswers;
      } else if (currentQuestion.answer_type === 'date') {
        // For date, use the parameter if provided, otherwise use state
        answer = answerValue || selectedDate;
        // Ensure we have a valid date
        if (!answer) {
          setIsSavingAnswer(false);
          setDateError('Please select a date');
          return;
        }
      } else {
        answer = answerValue || selectedAnswer;
      }

      // Special handling for inquiry_type question
      let updatedLeadId = leadId;
      if (currentQuestion.question_id === 'inquiry_type' || currentQuestion.question_id === 'completed_inquiry_type') {
        console.log('Handling inquiry_type question with answer:', answer);
        
        try {

          console.log(answer, 'answeransweranswer')
          // Determine enquiry type based on answer
          // let enquiryType = 
          let enquiryType = '';
          if (answer === 'New inquiry' || answer === 'New enquiry') {
            enquiryType = 'new';
          } else {
            enquiryType = 'existing';
          }
          // Call lead capture API with existing form data + enquiry field
          const leadCaptureResponse = await fetch(LEAD_API_URL, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: leadForm.firstName,
              last_name: leadForm.lastName,
              email_id: leadForm.email,
              country_code: leadForm.countryCode,
              phone_number: leadForm.phoneNumber,
              utm_source: "AI_CHAT_BOT",
              platform_name: defaultPlatformName,
              lead_source: 'AI_CHAT_BOT',
              enquiry: enquiryType
            })
          });

          if (!leadCaptureResponse.ok) {
            const errorData = await leadCaptureResponse.json();
            const isOtpVerificationExpired =
              leadCaptureResponse.status === 403 &&
              errorData?.data?.requiresOTPVerification === true &&
              errorData?.data?.mobile &&
              countryOptions.length > 0;
            if (isOtpVerificationExpired) {
              const parsed = parseE164Mobile(errorData.data.mobile, countryOptions);
              if (parsed) {
                setLeadForm((prev) => ({
                  ...prev,
                  countryCode: parsed.countryCode,
                  phoneNumber: parsed.phone,
                }));
                setPhoneVerified(false);
                setChatPhase('leadForm');
                toast.info(
                  errorData?.message ||
                    'Mobile verification has expired. Please verify your mobile number again.'
                );
                setIsSavingAnswer(false);
                return;
              }
            }
            throw new Error(errorData?.message || `Lead capture API failed with status: ${leadCaptureResponse.status}`);
          }

          const leadCaptureData = await leadCaptureResponse.json();
          
          if (leadCaptureData.success && leadCaptureData.data.leadId) {
            updatedLeadId = leadCaptureData.data.leadId;
            console.log('Updated lead ID from lead capture:', updatedLeadId);
            setLeadId(updatedLeadId);
            // Reset chat state flags for new/existing enquiry
            setIsChatStarted(leadCaptureData.data.isChatBotInitiated);
            setIsChatCompleted(leadCaptureData.data.isCompletedChatBot);
          } else {
            throw new Error('Failed to get lead ID from lead capture');
          }
        } catch (leadCaptureError) {
          console.error('Error calling lead capture for inquiry_type:', leadCaptureError);
          toast.error(leadCaptureError.message || 'Failed to process inquiry type. Please try again.');
          setIsSavingAnswer(false);
          return;
        }
      }

      if (shouldCreateDuplicateLead) {
        try {
          const duplicateLeadResponse = await fetch(LEAD_API_URL, {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: leadForm.firstName,
              last_name: leadForm.lastName,
              email_id: leadForm.email,
              country_code: leadForm.countryCode,
              phone_number: leadForm.phoneNumber,
              utm_source: 'AI_CHAT_BOT',
              platform_name: defaultPlatformName,
              lead_source: 'AI_CHAT_BOT',
              enquiry: 'new'
            }),
          });

          if (duplicateLeadResponse.ok) {
            const duplicateLeadData = await duplicateLeadResponse.json();
            if (duplicateLeadData.success && duplicateLeadData.data.leadId) {
              hasCreatedCompletionDuplicateLeadRef.current = true;
              updatedLeadId = duplicateLeadData.data.leadId;
              setLeadId(updatedLeadId);
              setIsChatStarted(duplicateLeadData.data.isChatBotInitiated);
              setIsChatCompleted(duplicateLeadData.data.isCompletedChatBot);
            } else {
              console.error('Failed to create duplicate lead from chatbot completion:', duplicateLeadData);
            }
          } else {
            console.error(`Duplicate lead capture API failed with status: ${duplicateLeadResponse.status}`);
          }
        } catch (duplicateLeadError) {
          console.error('Error creating duplicate lead after chatbot completion:', duplicateLeadError);
        }
      }

      const response = await fetch(`${API_BASE_URL}/onboarding/save-answer`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: updatedLeadId,
          question_id: currentQuestion.question_id,
          answer: answer
        })
      });

      if (!response.ok) {
        throw new Error(`Save answer API failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Check if new_lead_id is present in the response and update leadId
        if (data.new_lead_id) {
          console.log('Updating lead ID from save-answer response:', data.new_lead_id);
          updatedLeadId = data.new_lead_id;
          setLeadId(updatedLeadId);
          // Reset chat state flags for new lead
          setIsChatStarted(true);
          setIsChatCompleted(false);
        }

        // Add user's answer as a message
        let answerText;
        if (currentQuestion.answer_type === 'multi_select') {
          answerText = selectedAnswers.map(id => {
            const option = currentQuestion.options.find(opt => opt.id === id);
            return option ? option.label : id;
          }).join(', ');
        } else if (currentQuestion.answer_type === 'single_select') {
          const selectedId = answerValue || selectedAnswer;
          const option = currentQuestion.options.find(opt => opt.id === selectedId);
          answerText = option ? option.label : selectedId;
        } else if (currentQuestion.answer_type === 'date') {
          const dateToFormat = answerValue || selectedDate;
          if (dateToFormat) {
            try {
              const dateObj = new Date(dateToFormat + 'T00:00:00');
              answerText = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            } catch (error) {
              answerText = dateToFormat; // Fallback to raw date string
            }
          } else {
            answerText = '';
          }
        } else {
          answerText = answerValue || selectedAnswer;
        }

        const userAnswerMessage = {
          id: Date.now(),
          text: answerText,
          sender: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userAnswerMessage]);

        // Clear current question and form states
        setCurrentQuestion(null);
        setSelectedAnswer('');
        setSelectedAnswers([]);
        setSelectedDate('');
        setDateError('');
        setInputValue(''); // Clear text input as well

        // Fetch next question - use the updated lead ID
        // For inquiry_type or when new_lead_id is present, don't include flags on next question call
        await fetchNextQuestion(updatedLeadId, null, null, false);
      } else {
        throw new Error(data.message || 'Failed to save answer');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer. Please try again.');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  // Handle date change
  const handleDateChange = (dateString) => {
    if (!dateString) {
      setSelectedDate('');
      setDateError('');
      return;
    }

    // Update state first
    setSelectedDate(dateString);
    
    // Validate the date
    const isValid = validateDate(dateString);
    
    // Auto-submit if valid - pass the dateString directly to avoid state timing issues
    if (isValid && !isSavingAnswer && !isLoadingQuestion) {
      // Use setTimeout to ensure state is updated, but pass the dateString directly
      setTimeout(() => {
        saveAnswer(dateString);
      }, 50);
    }
  };

  const handleTextInputChange = (event) => {
    const { value } = event.target;

    if (isNumericAgeQuestion) {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      setInputValue(numericValue);
      return;
    }

    setInputValue(value);
  };

  // Handle answer submission
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    
    if (!currentQuestion) return;

    // Validate answer based on type
    if (currentQuestion.answer_type === 'single_select') {
      if (!selectedAnswer) {
        toast.error('Please select an option');
        return;
      }
      saveAnswer(selectedAnswer);
    } else if (currentQuestion.answer_type === 'multi_select') {
      if (selectedAnswers.length === 0) {
        toast.error('Please select at least one option');
        return;
      }
      saveAnswer();
    } else if (currentQuestion.answer_type === 'date') {
      if (!selectedDate) {
        setDateError('Please select a date');
        return;
      }
      if (!validateDate(selectedDate)) {
        return;
      }
      // Pass the date value directly to saveAnswer
      saveAnswer(selectedDate);
    } else if (currentQuestion.answer_type === 'text_field' || currentQuestion.answer_type === 'text') {
      const trimmedValue = inputValue.trim();

      if (!trimmedValue) {
        toast.error('Please enter your answer');
        return;
      }

      if (isNumericAgeQuestion) {
        const numericAge = parseInt(trimmedValue, 10);

        if (Number.isNaN(numericAge) || numericAge < 18) {
          toast.error('Age must be at least 18 years');
          return;
        }
      }

      saveAnswer(trimmedValue);
      setInputValue('');
    }
  };

  // Call API function
  const initiateCall = async (leadIdParam = null) => {
    const currentLeadId = leadIdParam || leadId;
    
    if (!currentLeadId) {
      console.error('Lead ID not available for call initiation');
      setCallStatus('failed');
      alert('Unable to initiate call. Please try again.');
      return;
    }
    
    if (!leadForm.phoneNumber) {
      alert('Phone number is required for call');
      return;
    }

    setIsInitiatingCall(true);
    setCallStatus('initiating');

    try {
      const response = await fetch(`${API_BASE_URL}/bland-ai/make-call`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: currentLeadId,
          phone_number: `${leadForm.countryCode}${leadForm.phoneNumber}`,
          // voice: "June",
          // wait_for_greeting: false,
          // record: true,
          // answered_by_enabled: true,
          // noise_cancellation: false,
          // interruption_threshold: 100,
          // block_interruptions: false,
          // max_duration: 12,
          // model: "base",
          // language: "en",
          // background_track: "none",
          // endpoint: "https://api.bland.ai",
          // voicemail_action: "hangup",
          // pathway_id: "c56fe09f-8f65-4c41-a8a3-57606c0000ee",
          // pathway_version: 2
        })
      });

      if (!response.ok) {
        throw new Error(`Call API failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setCallStatus('queued');
        setChatPhase('calling');
        
        // Show queued status for a few seconds, then simulate call completion
        // setTimeout(() => {
        //   setCallStatus('calling');
        // }, 3000); // Show queued status for 3 seconds
        
        // Simulate call completion after some time
        setTimeout(() => {
          setCallStatus('completed');
          setChatPhase('callCompleted');
        }, 30000); // 30 seconds simulation
      } else {
        throw new Error(data.message || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallStatus('failed');
      alert('Failed to initiate call. Please try again.');
    } finally {
      setIsInitiatingCall(false);
    }
  };

  const handleResetInputFields = () => {
    setLeadForm({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      phoneNumber: ''
    });
  };

  const handleLeadFormValueChange = (field, value) => {
    if (field === 'firstName' || field === 'lastName') {
      handleLeadFormChange(field, capitalizeFirst(value));
      return;
    }

    handleLeadFormChange(field, value);
  };

  return (
    <div className="chatbot-container">
      {/* Floating Chat Icon */}
      <button
        type="button"
        className={`chatbot-icon ${isOpen ? 'open' : ''}`}
        onClick={toggleChatbot}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat Popup */}
      <div className={`chatbot-popup ${isOpen ? 'open' : ''}`}>
        <ChatbotHeader
          chatPhase={chatPhase}
          onResetInputFields={handleResetInputFields}
          onBack={handleBack}
          onResetChat={handleResetClick}
          onToggleChatbot={toggleChatbot}
        />

        {/* Content Area */}
        <div className={`chatbot-content ${chatPhase === 'chatting' && currentQuestion && currentQuestion.answer_type && 
          (currentQuestion.answer_type === 'single_select' || 
           currentQuestion.answer_type === 'multi_select' || 
           currentQuestion.answer_type === 'date') ? 'has-question-input' : ''}`}>
          {chatPhase === 'initial' && (
            <ChatbotInitialOptions
              onSelectChat={() => setChatPhase('leadForm')}
              onSelectCall={() => setChatPhase('callForm')}
            />
          )}

          {/* Lead Form */}
          {chatPhase === 'leadForm' && (
            <ChatbotLeadForm
              title="Let's get started"
              description="Please provide your details to begin our conversation"
              leadForm={leadForm}
              validationErrors={validationErrors}
              countryOptions={countryOptions}
              isSubmitting={isSubmittingLead}
              phoneVerified={phoneVerified}
              otpType="chat_bot"
              verificationId={leadForm.verificationId}
              submitLabel={isSubmittingLead ? 'Starting Chat...' : 'Start Chat'}
              onChange={handleLeadFormValueChange}
              onSubmit={handleLeadFormSubmit}
              onNameKeyDown={handleNameKeyDown}
              onEmailKeyDown={handleEmailKeyDown}
              onPhoneVerificationChange={handlePhoneVerificationStatus}
              onVerificationIdChange={handlePhoneVerificationIdChange}
            />
          )}

          {/* Call Form */}
          {chatPhase === 'callForm' && (
            <ChatbotLeadForm
              title="Start a voice call"
              description="Please provide your details to connect you to our voice agent"
              leadForm={leadForm}
              validationErrors={validationErrors}
              countryOptions={countryOptions}
              isSubmitting={isSubmittingLead}
              phoneVerified={phoneVerified}
              otpType="bland_ai"
              verificationId={leadForm.verificationId}
              submitLabel={isSubmittingLead ? 'Continuing...' : 'Continue'}
              onChange={handleLeadFormValueChange}
              onSubmit={handleLeadFormSubmit}
              onNameKeyDown={handleNameKeyDown}
              onEmailKeyDown={handleEmailKeyDown}
              onPhoneVerificationChange={handlePhoneVerificationStatus}
              onVerificationIdChange={handlePhoneVerificationIdChange}
            />
          )}

          {chatPhase === 'voiceAgent' && (
            <ChatbotVoiceAgentPanel
              mode={voiceAgentMode}
              errorMessage={voiceAgentError}
              onStartCall={startVoiceAgentSession}
              onEndCall={stopVoiceAgentSession}
              onBack={() => {
                stopVoiceAgentSession();
                setChatPhase('initial');
              }}
            />
          )}

          {/* Call Status */}
          <ChatbotCallStatus
            chatPhase={chatPhase}
            callStatus={callStatus}
            leadForm={leadForm}
            isInitiatingCall={isInitiatingCall}
            onRetryCall={initiateCall}
            onResetChat={resetChatbot}
            onBackToOptions={() => setChatPhase('initial')}
          />

          {/* Chat Messages */}
          {(chatPhase === 'chatting' || chatPhase === 'completed') && (
            <ChatbotMessages
              messages={messages}
              isTyping={isTyping}
              isLoadingQuestion={isLoadingQuestion}
              renderMessageContent={renderMessageContent}
              formatTime={formatTime}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* Question Input Area - Fixed at bottom for select and date types */}
        {chatPhase === 'chatting' && currentQuestion && currentQuestion.answer_type && 
          (currentQuestion.answer_type === 'single_select' || 
           currentQuestion.answer_type === 'multi_select' || 
           currentQuestion.answer_type === 'date') && (
            <div className="chatbot-question-input">
              {currentQuestion.answer_type === 'single_select' && (
                <QuestionSelect
                  questionText=""
                  options={currentQuestion.options || []}
                  selectedValue={selectedAnswer}
                  onChange={(value) => {
                    setSelectedAnswer(value);
                    // Auto-submit when value is selected
                    if (value && !isSavingAnswer && !isLoadingQuestion) {
                      saveAnswer(value);
                    }
                  }}
                  isCityQuestion={
                    currentQuestion &&
                    typeof currentQuestion.question_id === 'string' &&
                    currentQuestion.question_id === 'city'
                  }
                  disabled={isSavingAnswer || isLoadingQuestion}
                />
              )}
              {currentQuestion.answer_type === 'multi_select' && (
                <QuestionSelect
                  questionText=""
                  options={currentQuestion.options || []}
                  selectedValues={selectedAnswers}
                  onMultiChange={(values) => {
                    setSelectedAnswers(values);
                    // Auto-submit when selections are made (with small delay to allow multiple selections)
                    if (values.length > 0 && !isSavingAnswer && !isLoadingQuestion) {
                      // Clear any existing timeout
                      if (multiSelectTimeoutRef.current) {
                        clearTimeout(multiSelectTimeoutRef.current);
                      }
                      // Use a small timeout to allow user to select multiple options quickly
                      multiSelectTimeoutRef.current = setTimeout(() => {
                        saveAnswer();
                        multiSelectTimeoutRef.current = null;
                      }, 800);
                    }
                  }}
                  isMultiSelect={true}
                  disabled={isSavingAnswer || isLoadingQuestion}
                />
              )}
              {currentQuestion.answer_type === 'date' && (
                <div className="date-input-container" style={{ position: 'relative', paddingTop: '20px' }}>
                  <DatePicker
                    selected={selectedDate ? new Date(selectedDate) : null}
                    onChange={(date) => {
                      const dateString = date ? dayjs(date).format('YYYY-MM-DD') : null;
                      if (dateString) {
                        handleDateChange(dateString);
                      } else {
                        setSelectedDate('');
                        setDateError('');
                      }
                    }}
                    maxDate={getMaxDate()}
                    minDate={getMinDate()}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={80}
                    scrollableYearDropdown
                    placeholderText="DD/MM/YYYY"
                    isClearable={false}
                    className={`date-picker-input ${dateError ? "error" : ""}`}
                    calendarClassName="chatbot-calendar"
                    wrapperClassName="w-full date-input-container"
                    autoComplete="off"
                    disabled={isSavingAnswer || isLoadingQuestion}
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate('');
                        setDateError('');
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-20 cursor-pointer"
                      title="Clear date"
                      style={{ top: 'calc(50% + 12px)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  {dateError && (
                    <span className="text-red-500 text-sm mt-1 block">{dateError}</span>
                  )}
                  {isSavingAnswer && (
                    <div className="saving-indicator">
                      <div className="spinner-small"></div>
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Input Area - Show based on current question type */}
        {chatPhase === 'chatting' && currentQuestion && currentQuestion.answer_type && (
              // Only show input for text_field and text, select and date types auto-submit
              (currentQuestion.answer_type === 'text_field' || currentQuestion.answer_type === 'text') && (
                <div className="chatbot-input">
                <form onSubmit={handleAnswerSubmit}>
                  <div className="input-container">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleTextInputChange}
                      placeholder="Type your answer..."
                      maxLength={isNumericAgeQuestion ? 2 : undefined}
                      className="message-input"
                      disabled={isSavingAnswer || isLoadingQuestion}
                    />
                    <button 
                      type="submit" 
                      className="send-button"
                      disabled={
                        isSavingAnswer || 
                        isLoadingQuestion ||
                        !inputValue.trim()
                      }
                    >
                      {isSavingAnswer ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )
        )}
        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="chatbot-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <div className="chatbot-modal">
              <div className="chatbot-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17H12.01" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 id="reset-modal-title" className="chatbot-modal-title">Start a new chat?</h4>
              <p className="chatbot-modal-text">This will clear the current conversation.</p>
              <div className="chatbot-modal-actions">
                <button className="modal-button cancel" onClick={cancelReset}>Cancel</button>
                <button className="modal-button confirm" onClick={confirmReset}>Start New</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
