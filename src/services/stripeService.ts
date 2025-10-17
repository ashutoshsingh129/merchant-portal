// Stripe Transaction Types
export interface StripeTransaction {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'refunded';
    description?: string;
    customer?: {
        id: string;
        email?: string;
        name?: string;
    };
    payment_method?: {
        type: string;
        card?: {
            brand: string;
            last4: string;
        };
    };
    created: number;
    metadata?: Record<string, string>;
    fee?: number;
    net?: number;
}

export interface StripeTransactionListResponse {
    data: StripeTransaction[];
    has_more: boolean;
    total_count?: number;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// Mock data for development
const mockTransactions: StripeTransaction[] = [
    {
        id: 'pi_1H8x8x2eZvKYlo2C',
        amount: 10000, // $100.00 in cents
        currency: 'usd',
        status: 'succeeded',
        description: 'ok ok',
        customer: {
            id: 'cus_123',
            email: 'abc@gmail.com',
        },
        payment_method: {
            type: 'card',
            card: {
                brand: 'visa',
                last4: '4242',
            },
        },
        created: 1602334380,
        fee: 290,
        net: 9710,
    },
    {
        id: 'pi_1H8x8x2eZvKYlo2D',
        amount: 10000, // €100.00 in cents
        currency: 'eur',
        status: 'succeeded',
        description: '(created by Testing Scenarios)',
        payment_method: {
            type: 'card',
            card: {
                brand: 'visa',
                last4: '0077',
            },
        },
        created: 1600774260,
        fee: 290,
        net: 9710,
    },
    {
        id: 'pi_1H8x8x2eZvKYlo2E',
        amount: 5000, // $50.00 in cents
        currency: 'usd',
        status: 'pending',
        description: 'Test payment',
        customer: {
            id: 'cus_456',
            email: 'test@example.com',
        },
        payment_method: {
            type: 'card',
            card: {
                brand: 'mastercard',
                last4: '5555',
            },
        },
        created: 1602334500,
    },
    {
        id: 'pi_1H8x8x2eZvKYlo2F',
        amount: 2500, // $25.00 in cents
        currency: 'usd',
        status: 'refunded',
        description: 'Refunded payment',
        customer: {
            id: 'cus_789',
            email: 'refund@example.com',
        },
        payment_method: {
            type: 'card',
            card: {
                brand: 'amex',
                last4: '1234',
            },
        },
        created: 1602334200,
        fee: 73,
        net: 2427,
    },
];

export class StripeService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl =
            process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
        this.apiKey = process.env.REACT_APP_STRIPE_SECRET_KEY || '';
    }

    // Get transactions with pagination and filters
    async getTransactions(params?: {
        limit?: number;
        starting_after?: string;
        ending_before?: string;
        status?: string;
        customer?: string;
    }): Promise<ApiResponse<StripeTransactionListResponse>> {
        try {
            // For now, return mock data
            // In production, this would make actual API calls to your backend
            // which would then call Stripe's API

            const limit = params?.limit || 10;
            const filteredTransactions = mockTransactions.filter(
                transaction => {
                    if (
                        params?.status &&
                        transaction.status !== params.status
                    ) {
                        return false;
                    }
                    if (
                        params?.customer &&
                        transaction.customer?.id !== params.customer
                    ) {
                        return false;
                    }
                    return true;
                }
            );

            const response: StripeTransactionListResponse = {
                data: filteredTransactions.slice(0, limit),
                has_more: filteredTransactions.length > limit,
                total_count: filteredTransactions.length,
            };

            return {
                data: response,
                message: 'Transactions fetched successfully',
                success: true,
            };
        } catch (error) {
            return {
                data: { data: [], has_more: false },
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch transactions',
                success: false,
            };
        }
    }

    // Get a single transaction by ID
    async getTransaction(
        transactionId: string
    ): Promise<ApiResponse<StripeTransaction | null>> {
        try {
            const transaction = mockTransactions.find(
                t => t.id === transactionId
            );

            return {
                data: transaction || null,
                message: transaction
                    ? 'Transaction fetched successfully'
                    : 'Transaction not found',
                success: !!transaction,
            };
        } catch (error) {
            return {
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch transaction',
                success: false,
            };
        }
    }

    // Get transaction summary/stats
    async getTransactionSummary(): Promise<
        ApiResponse<{
            total: number;
            succeeded: number;
            pending: number;
            failed: number;
            refunded: number;
            disputed: number;
            uncaptured: number;
        }>
    > {
        try {
            const summary = mockTransactions.reduce(
                (acc, transaction) => {
                    acc.total++;
                    switch (transaction.status) {
                        case 'succeeded':
                            acc.succeeded++;
                            break;
                        case 'pending':
                            acc.pending++;
                            break;
                        case 'failed':
                            acc.failed++;
                            break;
                        case 'refunded':
                            acc.refunded++;
                            break;
                        case 'canceled':
                            acc.disputed++;
                            break;
                        default:
                            acc.uncaptured++;
                    }
                    return acc;
                },
                {
                    total: 0,
                    succeeded: 0,
                    pending: 0,
                    failed: 0,
                    refunded: 0,
                    disputed: 0,
                    uncaptured: 0,
                }
            );

            return {
                data: summary,
                message: 'Transaction summary fetched successfully',
                success: true,
            };
        } catch (error) {
            return {
                data: {
                    total: 0,
                    succeeded: 0,
                    pending: 0,
                    failed: 0,
                    refunded: 0,
                    disputed: 0,
                    uncaptured: 0,
                },
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch transaction summary',
                success: false,
            };
        }
    }

    // Format amount for display
    formatAmount(amount: number, currency: string): string {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        });
        return formatter.format(amount / 100);
    }

    // Format date for display
    formatDate(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    // Get status color for UI
    getStatusColor(status: string): string {
        switch (status) {
            case 'succeeded':
                return '#10b981';
            case 'pending':
                return '#f59e0b';
            case 'failed':
                return '#ef4444';
            case 'refunded':
                return '#6b7280';
            case 'canceled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    }
}

// Export singleton instance
export const stripeService = new StripeService();
