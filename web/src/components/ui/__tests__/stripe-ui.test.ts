import { useToastStore } from "@/stores/toast-store";
import { calculateStripeCharge, calculateStripeFee } from "@/lib/stripe-fee";

// Reset store between tests
beforeEach(() => {
  useToastStore.setState({ toast: null });
});

describe("Toast Store", () => {
  it("showToast updates state with correct message and variant", () => {
    useToastStore.getState().showToast("Payment successful!", "success");

    const state = useToastStore.getState();
    expect(state.toast?.message).toBe("Payment successful!");
    expect(state.toast?.variant).toBe("success");
    expect(state.toast?.id).toBeDefined();
  });

  it("supports error variant for failed payments", () => {
    useToastStore.getState().showToast("Payment cancelled", "error");

    const state = useToastStore.getState();
    expect(state.toast?.message).toBe("Payment cancelled");
    expect(state.toast?.variant).toBe("error");
  });

  it("dismissToast clears the toast state", () => {
    useToastStore.getState().showToast("Test message", "success");
    expect(useToastStore.getState().toast).not.toBeNull();

    useToastStore.getState().dismissToast();
    expect(useToastStore.getState().toast).toBeNull();
  });

  it("new toast replaces existing toast (single toast at a time)", () => {
    useToastStore.getState().showToast("First message", "success");
    const firstId = useToastStore.getState().toast?.id;

    useToastStore.getState().showToast("Second message", "error");
    const secondId = useToastStore.getState().toast?.id;

    expect(secondId).not.toBe(firstId);
    expect(useToastStore.getState().toast?.message).toBe("Second message");
    expect(useToastStore.getState().toast?.variant).toBe("error");
  });
});

describe("Fee Display Calculations for ConfirmationStep", () => {
  it("calculates fee breakdown correctly for $100 deposit", () => {
    const depositAmount = 100;
    const processingFee = calculateStripeFee(depositAmount);
    const totalCharge = calculateStripeCharge(depositAmount);

    // Fee should be around $3.30 for $100 deposit
    expect(processingFee).toBeGreaterThan(3);
    expect(processingFee).toBeLessThan(4);

    // Total should be deposit + fee (approximately)
    expect(totalCharge).toBeCloseTo(depositAmount + processingFee, 2);
  });

  it("calculates correct values for minimum deposit $100", () => {
    const amount = 100;
    const fee = calculateStripeFee(amount);
    const total = calculateStripeCharge(amount);

    // Fee formula: (amount + 0.30) / 0.971 - amount
    expect(fee).toBeCloseTo(3.30, 1);
    expect(total).toBeCloseTo(103.30, 1);
  });

  it("calculates correct values for maximum deposit $1000", () => {
    const amount = 1000;
    const fee = calculateStripeFee(amount);
    const total = calculateStripeCharge(amount);

    // For $1000 deposit
    expect(fee).toBeGreaterThan(29);
    expect(fee).toBeLessThan(32);
    expect(total).toBeCloseTo(amount + fee, 2);
  });

  it("maintains deposit + fee = total relationship for all amounts", () => {
    const testAmounts = [100, 200, 300, 500, 750, 1000];

    for (const amount of testAmounts) {
      const fee = calculateStripeFee(amount);
      const total = calculateStripeCharge(amount);

      // Total should always be greater than deposit
      expect(total).toBeGreaterThan(amount);

      // Fee should be positive
      expect(fee).toBeGreaterThan(0);

      // Total should equal deposit + fee (within floating point precision)
      expect(total).toBeCloseTo(amount + fee, 2);
    }
  });
});
