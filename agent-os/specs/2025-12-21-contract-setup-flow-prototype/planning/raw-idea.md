# Raw Idea: Contract Setup Flow (Prototype)

## Feature Description

Build the UI for users to start a new habit cycle with:
- Text input for habit description
- Duration slider (7-30 days)
- Deposit amount input ($100-$1000)
- No actual payment—just capture the intent and generate the hidden reward schedule
- Store in localStorage

## Context

This is Phase 1A, item #2 on the product roadmap. This feature validates the core habit cycle experience as part of the Experience Prototype phase. The goal is to answer "Does the UX feel right?" before investing in auth, payments, and database infrastructure.

## Key Constraints

- No real payment processing (prototype phase)
- Use localStorage for data persistence
- Generate the hidden reward schedule using the existing Variable Reward Allocation Algorithm
- No user authentication required at this stage

## Success Criteria

- Users can input their habit commitment details
- The interface captures user intent effectively
- Hidden reward schedule is generated and stored
- Data persists in localStorage for subsequent features (Daily Check-In, Reveal Experience, etc.)
