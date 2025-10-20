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

export class StripeService {
    private stripe: any;

    constructor() {
        // Initialize Stripe with your secret key
        // Note: In production, you should never expose secret keys in frontend
        // This is for development/testing only
        this.stripe = require('stripe')(
            process.env.REACT_APP_STRIPE_SECRET_KEY
        );
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
            const stripeParams: any = {
                limit: params?.limit || 10,
            };

            if (params?.starting_after)
                stripeParams.starting_after = params.starting_after;
            if (params?.ending_before)
                stripeParams.ending_before = params.ending_before;
            if (params?.status) stripeParams.status = params.status;
            if (params?.customer) stripeParams.customer = params.customer;

            const payments =
                await this.stripe.paymentIntents.list(stripeParams);

            // Transform Stripe data to match our interface
            const transactions = payments.data.map((payment: any) => ({
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                description: payment.description,
                customer: payment.customer
                    ? {
                          id: payment.customer,
                          email: payment.receipt_email,
                      }
                    : undefined,
                payment_method: payment.payment_method
                    ? {
                          type: payment.payment_method.type,
                          card: payment.payment_method.card
                              ? {
                                    brand: payment.payment_method.card.brand,
                                    last4: payment.payment_method.card.last4,
                                }
                              : undefined,
                      }
                    : undefined,
                created: payment.created,
                metadata: payment.metadata,
                fee: payment.application_fee_amount,
                net: payment.amount - (payment.application_fee_amount || 0),
            }));

            return {
                data: {
                    data: transactions,
                    has_more: payments.has_more,
                    total_count: transactions.length,
                },
                message: 'Transactions fetched successfully',
                success: true,
            };
        } catch (error) {
            console.error('Error fetching transactions:', error);
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
            const payment =
                await this.stripe.paymentIntents.retrieve(transactionId);

            const transaction = {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                description: payment.description,
                customer: payment.customer
                    ? {
                          id: payment.customer,
                          email: payment.receipt_email,
                      }
                    : undefined,
                payment_method: payment.payment_method
                    ? {
                          type: payment.payment_method.type,
                          card: payment.payment_method.card
                              ? {
                                    brand: payment.payment_method.card.brand,
                                    last4: payment.payment_method.card.last4,
                                }
                              : undefined,
                      }
                    : undefined,
                created: payment.created,
                metadata: payment.metadata,
                fee: payment.application_fee_amount,
                net: payment.amount - (payment.application_fee_amount || 0),
            };

            return {
                data: transaction,
                message: 'Transaction fetched successfully',
                success: true,
            };
        } catch (error) {
            console.error('Error fetching transaction:', error);
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

    // Get transactions and summary in a single optimized call
    async getTransactionsWithSummary(params?: {
        limit?: number;
        starting_after?: string;
        ending_before?: string;
        status?: string;
        customer?: string;
    }): Promise<
        ApiResponse<{
            transactions: StripeTransactionListResponse;
            summary: {
                total: number;
                succeeded: number;
                pending: number;
                failed: number;
                refunded: number;
                disputed: number;
                uncaptured: number;
            };
        }>
    > {
        try {
            const stripeParams: any = {
                limit: params?.limit || 100, // Use higher limit to get more data for summary
            };

            if (params?.starting_after)
                stripeParams.starting_after = params.starting_after;
            if (params?.ending_before)
                stripeParams.ending_before = params.ending_before;
            if (params?.status) stripeParams.status = params.status;
            if (params?.customer) stripeParams.customer = params.customer;

            const payments =
                await this.stripe.paymentIntents.list(stripeParams);

            // Transform Stripe data to match our interface
            const transactions = payments.data.map((payment: any) => ({
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                description: payment.description,
                customer: payment.customer
                    ? {
                          id: payment.customer,
                          email: payment.receipt_email,
                      }
                    : undefined,
                payment_method: payment.payment_method
                    ? {
                          type: payment.payment_method.type,
                          card: payment.payment_method.card
                              ? {
                                    brand: payment.payment_method.card.brand,
                                    last4: payment.payment_method.card.last4,
                                }
                              : undefined,
                      }
                    : undefined,
                created: payment.created,
                metadata: payment.metadata,
                fee: payment.application_fee_amount,
                net: payment.amount - (payment.application_fee_amount || 0),
            }));

            // Calculate summary from the same data
            const summary = payments.data.reduce(
                (acc: any, payment: any) => {
                    acc.total++;
                    switch (payment.status) {
                        case 'succeeded':
                            acc.succeeded++;
                            break;
                        case 'pending':
                            acc.pending++;
                            break;
                        case 'failed':
                            acc.failed++;
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
                data: {
                    transactions: {
                        data: transactions,
                        has_more: payments.has_more,
                        total_count: transactions.length,
                    },
                    summary,
                },
                message: 'Transactions and summary fetched successfully',
                success: true,
            };
        } catch (error) {
            console.error('Error fetching transactions with summary:', error);
            return {
                data: {
                    transactions: { data: [], has_more: false },
                    summary: {
                        total: 0,
                        succeeded: 0,
                        pending: 0,
                        failed: 0,
                        refunded: 0,
                        disputed: 0,
                        uncaptured: 0,
                    },
                },
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch transactions with summary',
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
