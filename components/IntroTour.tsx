"use client";

import { useEffect, useState } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { useAuth } from "@/lib/auth";

const INTRO_STORAGE_KEY = "ghardaar24_intro_completed";

export default function IntroTour() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    // Check if user has already seen the intro
    const hasSeenIntro = localStorage.getItem(INTRO_STORAGE_KEY);
    if (hasSeenIntro) return;

    // Wait for DOM elements to be ready
    const timeoutId = setTimeout(() => {
      startIntro();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [mounted, loading, user]);

  const startIntro = () => {
    const intro = introJs();

    // Base steps for all visitors
    const baseSteps = [
      {
        element: "#intro-logo",
        intro:
          "<strong>Welcome to Ghardaar24! 🏠</strong><br/>Your trusted partner for finding the perfect home. Let us give you a quick tour!",
        position: "bottom",
      },
      {
        element: "#intro-properties",
        intro:
          "<strong>Browse Properties</strong><br/>Explore our listings - Buy, Rent, or find Resale properties that match your needs.",
        position: "bottom",
      },
      {
        element: "#intro-services",
        intro:
          "<strong>Our Services</strong><br/>We offer Home Loans assistance, Interior Design consultations, and Vastu guidance to make your home perfect.",
        position: "bottom",
      },
    ];

    // Steps for non-logged-in users
    const authSteps = !user
      ? [
          {
            element: "#intro-auth",
            intro:
              "<strong>Sign Up or Login</strong><br/>Create an account to save properties, submit listings, and access personalized features.",
            position: "bottom",
          },
        ]
      : [
          {
            element: "#intro-user-menu",
            intro:
              "<strong>Your Profile</strong><br/>Access your dashboard, manage saved properties, and view your listings.",
            position: "bottom",
          },
        ];

    // Common closing steps
    const closingSteps = [
      {
        element: "#intro-search",
        intro:
          "<strong>Find Your Dream Home</strong><br/>Use our powerful search to filter properties by location, price, and type.",
        position: "top",
      },
      {
        element: "#intro-featured",
        intro:
          "<strong>Featured Properties</strong><br/>Discover our handpicked premium listings and popular properties.",
        position: "top",
      },
      {
        element: "#intro-contact",
        intro:
          "<strong>Get Expert Help</strong><br/>Connect with our experienced agents for personalized assistance. We're here to help!",
        position: "top",
      },
    ];

    // Steps specifically about property submission (for logged-in users)
    const propertySubmitSteps = user
      ? [
          {
            intro:
              "<strong>List Your Property</strong><br/>Ready to sell or rent? Go to your dashboard and click 'Submit Property' to list your property with us. It's quick and easy!",
          },
        ]
      : [
          {
            intro:
              "<strong>Want to List Your Property?</strong><br/>Sign up for a free account and you can easily list your property for sale or rent. Reach thousands of potential buyers!",
          },
        ];

    const allSteps = [
      ...baseSteps,
      ...authSteps,
      ...closingSteps,
      ...propertySubmitSteps,
    ];

    intro.setOptions({
      steps: allSteps,
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      showStepNumbers: false,
      nextLabel: "Next →",
      prevLabel: "← Back",
      doneLabel: "Get Started!",
      skipLabel: "Skip Tour",
      hidePrev: true,
      scrollToElement: true,
      scrollPadding: 100,
      overlayOpacity: 0.7,
    });

    intro.oncomplete(() => {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    });

    intro.onexit(() => {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    });

    intro.start();
  };

  return null;
}
