/**
 * Integration tests for Stripe payment flow.
 *
 * These tests verify:
 * - Contract creation with pending payment status
 * - Contract storage with Stripe session ID
 * - Payment status updates (pending -> completed, pending -> failed)
 * - Dashboard contract loading respects payment status
 */

import { contractSchema } from "@/schemas/contract";
import { createContract } from "../contract-actions";
import {
  loadContract,
  loadCompletedContract,
  updateContractPaymentStatus,
} from "../contract-storage";
import type { ContractFormData } from "@/schemas/contract";

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window and localStorage for Node.js test environment
Object.defineProperty(global, "window", {
  value: {},
  writable: true,
});
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock crypto.randomUUID for consistent test IDs
let uuidCounter = 0;
global.crypto = {
  ...global.crypto,
  randomUUID: () => `12345678-1234-1234-1234-12345678${String(uuidCounter++).padStart(4, "0")}`,
};

beforeEach(() => {
  localStorageMock.clear();
  uuidCounter = 0;
});

// Valid form data for testing
const validFormData: ContractFormData = {
  habitTitle: "Exercise daily",
  duration: 21,
  depositAmount: 100,
  startDate: "today",
  verificationType: "honor_system",
};

describe("Contract Creation with Payment Status", () => {
  it("creates contract with pending payment status by default", () => {
    const contract = createContract(validFormData);

    expect(contract.paymentStatus).toBe("pending");
    expect(contract.stripeSessionId).toBeUndefined();
  });

  it("creates contract with pending payment status explicitly", () => {
    const contract = createContract(validFormData, { paymentStatus: "pending" });

    expect(contract.paymentStatus).toBe("pending");
  });

  it("can create contract with completed payment status", () => {
    const contract = createContract(validFormData, {
      paymentStatus: "completed",
      stripeSessionId: "cs_test_session_123",
    });

    expect(contract.paymentStatus).toBe("completed");
    expect(contract.stripeSessionId).toBe("cs_test_session_123");
  });

  it("creates contract with all required schema fields", () => {
    const contract = createContract(validFormData, {
      paymentStatus: "pending",
    });

    // Verify contract has all required fields
    expect(contract.id).toBeDefined();
    expect(contract.habitTitle).toBe("Exercise daily");
    expect(contract.duration).toBe(21);
    expect(contract.depositAmount).toBe(100);
    expect(contract.startDate).toBe("today");
    expect(contract.createdAt).toBeDefined();
    expect(contract.rewardSchedule).toBeDefined();
    expect(contract.verificationType).toBe("honor_system");
    expect(contract.paymentStatus).toBe("pending");
  });
});

describe("Payment Status Updates", () => {
  it("updates pending contract to completed status", () => {
    const contract = createContract(validFormData, { paymentStatus: "pending" });

    const updated = updateContractPaymentStatus(
      contract.id,
      "completed",
      "cs_test_session_789"
    );

    expect(updated).toBe(true);

    const loadedContract = loadContract();
    expect(loadedContract?.paymentStatus).toBe("completed");
    expect(loadedContract?.stripeSessionId).toBe("cs_test_session_789");
  });

  it("updates pending contract to failed status on cancellation", () => {
    const contract = createContract(validFormData, { paymentStatus: "pending" });

    const updated = updateContractPaymentStatus(
      contract.id,
      "failed",
      "cs_test_cancelled_session"
    );

    expect(updated).toBe(true);

    const loadedContract = loadContract();
    expect(loadedContract?.paymentStatus).toBe("failed");
  });

  it("returns false when updating non-existent contract", () => {
    const updated = updateContractPaymentStatus(
      "12345678-1234-1234-1234-123456789999",
      "completed"
    );

    expect(updated).toBe(false);
  });

  it("returns false when contract ID does not match", () => {
    createContract(validFormData, { paymentStatus: "pending" });

    const updated = updateContractPaymentStatus(
      "12345678-1234-1234-1234-different-id",
      "completed"
    );

    expect(updated).toBe(false);
  });
});

describe("Dashboard Contract Loading", () => {
  it("loadCompletedContract returns null for pending contracts", () => {
    createContract(validFormData, { paymentStatus: "pending" });

    const contract = loadCompletedContract();
    expect(contract).toBeNull();
  });

  it("loadCompletedContract returns null for failed contracts", () => {
    const created = createContract(validFormData, { paymentStatus: "pending" });
    updateContractPaymentStatus(created.id, "failed");

    const contract = loadCompletedContract();
    expect(contract).toBeNull();
  });

  it("loadCompletedContract returns contract with completed payment", () => {
    const created = createContract(validFormData, { paymentStatus: "pending" });
    updateContractPaymentStatus(created.id, "completed", "cs_test_paid");

    const contract = loadCompletedContract();
    expect(contract).not.toBeNull();
    expect(contract?.paymentStatus).toBe("completed");
  });

  it("loadContract returns any contract regardless of status", () => {
    createContract(validFormData, { paymentStatus: "pending" });

    const contract = loadContract();
    expect(contract).not.toBeNull();
    expect(contract?.paymentStatus).toBe("pending");
  });
});

describe("Full Payment Flow Integration", () => {
  it("simulates successful Stripe checkout flow", () => {
    // Step 1: User submits wizard, contract created with pending status
    const contract = createContract(validFormData, {
      paymentStatus: "pending",
    });
    expect(contract.paymentStatus).toBe("pending");

    // Step 2: User redirected to Stripe (session ID would come from API)
    const stripeSessionId = "cs_test_checkout_session_id";

    // Step 3: User completes payment, callback updates status
    const updated = updateContractPaymentStatus(
      contract.id,
      "completed",
      stripeSessionId
    );
    expect(updated).toBe(true);

    // Step 4: Dashboard loads completed contract
    const dashboardContract = loadCompletedContract();
    expect(dashboardContract).not.toBeNull();
    expect(dashboardContract?.id).toBe(contract.id);
    expect(dashboardContract?.paymentStatus).toBe("completed");
    expect(dashboardContract?.stripeSessionId).toBe(stripeSessionId);
  });

  it("simulates cancelled Stripe checkout flow", () => {
    // Step 1: User submits wizard, contract created with pending status
    const contract = createContract(validFormData, {
      paymentStatus: "pending",
    });

    // Step 2: User cancels at Stripe checkout
    const stripeSessionId = "cs_test_cancelled_session_id";
    updateContractPaymentStatus(contract.id, "failed", stripeSessionId);

    // Step 3: Dashboard redirects to wizard (no completed contract)
    const dashboardContract = loadCompletedContract();
    expect(dashboardContract).toBeNull();

    // Step 4: Wizard can still access the failed contract via loadContract
    const pendingContract = loadContract();
    expect(pendingContract).not.toBeNull();
    expect(pendingContract?.paymentStatus).toBe("failed");
  });
});
