import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    CheckCircle,
    Schedule,
    Error,
    Cancel,
    Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { stripeService, StripeTransaction } from '../../services/stripeService';

const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    fontWeight: 600,
    color: '#1a202c',
    marginBottom: theme.spacing(1),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 48,
        '&.Mui-selected': {
            color: '#635bff',
        },
    },
    '& .MuiTabs-indicator': {
        backgroundColor: '#635bff',
    },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    border: '1px solid #e2e8f0',
    '&.selected': {
        borderColor: '#635bff',
        backgroundColor: '#f8f9ff',
    },
}));

const SummaryCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(2),
    '&:last-child': {
        paddingBottom: theme.spacing(2),
    },
}));

const SummaryNumber = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1a202c',
}));

const SummaryLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: theme.spacing(0.5),
}));

const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: '1px solid #f1f5f9',
        padding: theme.spacing(1.5),
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
        backgroundColor: '#f8fafc',
        fontWeight: 600,
        fontSize: '0.75rem',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
    fontSize: '0.75rem',
    height: 24,
    fontWeight: 500,
}));

const PaymentMethodBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const CardBrandBox = styled(Box)(({ theme }) => ({
    width: 24,
    height: 16,
    backgroundColor: '#1a202c',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.625rem',
    fontWeight: 'bold',
}));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`transactions-tabpanel-${index}`}
            aria-labelledby={`transactions-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const Transactions: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
    const [summary, setSummary] = useState({
        total: 0,
        succeeded: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        disputed: 0,
        uncaptured: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSummary, setSelectedSummary] = useState('all');

    const tabs = [{ label: 'Payments', value: 'payments' }];

    useEffect(() => {
        fetchTransactions();
        fetchSummary();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await stripeService.getTransactions();
            if (response.success) {
                setTransactions(response.data.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await stripeService.getTransactionSummary();
            if (response.success) {
                setSummary(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSummaryClick = (type: string) => {
        setSelectedSummary(type);
        // In a real app, this would filter transactions
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />;
            case 'pending':
                return <Schedule sx={{ fontSize: 16, color: '#f59e0b' }} />;
            case 'failed':
                return <Error sx={{ fontSize: 16, color: '#ef4444' }} />;
            case 'refunded':
                return <Refresh sx={{ fontSize: 16, color: '#6b7280' }} />;
            case 'canceled':
                return <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />;
            default:
                return <Schedule sx={{ fontSize: 16, color: '#6b7280' }} />;
        }
    };

    const getCardBrandLogo = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa':
                return 'VISA';
            case 'mastercard':
                return 'MC';
            case 'amex':
                return 'AMEX';
            case 'discover':
                return 'DISC';
            default:
                return brand.substring(0, 4).toUpperCase();
        }
    };

    if (loading) {
        return (
            <StyledContainer>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="400px"
                >
                    <CircularProgress />
                </Box>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <HeaderSection>
                <PageTitle>Transactions</PageTitle>

                <StyledTabs value={activeTab} onChange={handleTabChange}>
                    {tabs.map((tab, index) => (
                        <Tab key={tab.value} label={tab.label} />
                    ))}
                </StyledTabs>
            </HeaderSection>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TabPanel value={activeTab} index={0}>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'all' ? 'selected' : ''
                            }
                            onClick={() => handleSummaryClick('all')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>{summary.total}</SummaryNumber>
                                <SummaryLabel>All</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'succeeded'
                                    ? 'selected'
                                    : ''
                            }
                            onClick={() => handleSummaryClick('succeeded')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>
                                    {summary.succeeded}
                                </SummaryNumber>
                                <SummaryLabel>Succeeded</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'refunded' ? 'selected' : ''
                            }
                            onClick={() => handleSummaryClick('refunded')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>
                                    {summary.refunded}
                                </SummaryNumber>
                                <SummaryLabel>Refunded</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'disputed' ? 'selected' : ''
                            }
                            onClick={() => handleSummaryClick('disputed')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>
                                    {summary.disputed}
                                </SummaryNumber>
                                <SummaryLabel>Disputed</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'failed' ? 'selected' : ''
                            }
                            onClick={() => handleSummaryClick('failed')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>{summary.failed}</SummaryNumber>
                                <SummaryLabel>Failed</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <SummaryCard
                            className={
                                selectedSummary === 'uncaptured'
                                    ? 'selected'
                                    : ''
                            }
                            onClick={() => handleSummaryClick('uncaptured')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <SummaryCardContent>
                                <SummaryNumber>
                                    {summary.uncaptured}
                                </SummaryNumber>
                                <SummaryLabel>Uncaptured</SummaryLabel>
                            </SummaryCardContent>
                        </SummaryCard>
                    </Grid>
                </Grid>

                {/* Transactions Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <StyledTable>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment method</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Settlement merchant</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map(transaction => (
                                <TableRow key={transaction.id} hover>
                                    <TableCell padding="checkbox">
                                        <input type="checkbox" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                        >
                                            {stripeService.formatAmount(
                                                transaction.amount,
                                                transaction.currency
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <PaymentMethodBox>
                                            {getStatusIcon(transaction.status)}
                                            <StatusChip
                                                label={transaction.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor:
                                                        stripeService.getStatusColor(
                                                            transaction.status
                                                        ),
                                                    color: 'white',
                                                }}
                                            />
                                            {transaction.payment_method
                                                ?.card && (
                                                <>
                                                    <CardBrandBox>
                                                        {getCardBrandLogo(
                                                            transaction
                                                                .payment_method
                                                                .card.brand
                                                        )}
                                                    </CardBrandBox>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        ...
                                                        {
                                                            transaction
                                                                .payment_method
                                                                .card.last4
                                                        }
                                                    </Typography>
                                                </>
                                            )}
                                        </PaymentMethodBox>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {transaction.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {transaction.customer?.email || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {stripeService.formatDate(
                                                transaction.created
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Example-merchant...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </StyledTable>
                </TableContainer>
            </TabPanel>

            {/* Other tab panels would go here */}
            {tabs.slice(1).map((tab, index) => (
                <TabPanel key={tab.value} value={activeTab} index={index + 1}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="400px"
                    >
                        <Typography variant="h6" color="text.secondary">
                            {tab.label} - Coming Soon
                        </Typography>
                    </Box>
                </TabPanel>
            ))}
        </StyledContainer>
    );
};

export default Transactions;
