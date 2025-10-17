import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Typography,
    Box,
    Collapse,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Home,
    AccountBalance,
    Receipt,
    People,
    Inventory,
    Analytics,
    Assessment,
    AccountBalanceWallet,
    ConnectWithoutContact,
    Payment,
    TrendingUp,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;
const collapsedWidth = 64;

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: prop => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
    width: open ? drawerWidth : collapsedWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    '& .MuiDrawer-paper': {
        width: open ? drawerWidth : collapsedWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
    },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#635bff',
    marginLeft: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: theme.spacing(1, 2),
    marginTop: theme.spacing(2),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.Mui-selected': {
        backgroundColor: '#635bff',
        '&:hover': {
            backgroundColor: '#635bff',
        },
    },
}));

const StyledListItemIcon = styled(ListItemIcon)({
    minWidth: 40,
    color: 'inherit',
});

const StyledListItemText = styled(ListItemText)({
    '& .MuiListItemText-primary': {
        fontSize: '0.875rem',
        fontWeight: 500,
    },
});

interface SidebarProps {
    open: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedItem, setSelectedItem] = useState(location.pathname);

    const mainMenuItems = [
        {
            id: 'transactions',
            label: 'Transactions',
            icon: <Receipt />,
            path: '/transactions',
        },
        {
            id: 'payouts',
            label: 'Payouts',
            icon: <AccountBalance />,
            path: '/payouts',
        },
    ];

    const handleItemClick = (itemId: string, path: string) => {
        setSelectedItem(itemId);
        navigate(path);
    };

    return (
        <StyledDrawer variant="permanent" open={open}>
            <DrawerHeader>
                <IconButton onClick={onToggle}>
                    {open ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            </DrawerHeader>

            <LogoContainer>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#635bff',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    S
                </Box>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <LogoText>SimplyPay</LogoText>
                </Collapse>
            </LogoContainer>

            <List>
                {mainMenuItems.map(item => (
                    <ListItem key={item.id} disablePadding>
                        <StyledListItemButton
                            selected={selectedItem === item.path}
                            onClick={() => handleItemClick(item.id, item.path)}
                        >
                            <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                            <Collapse in={open} timeout="auto" unmountOnExit>
                                <StyledListItemText primary={item.label} />
                            </Collapse>
                        </StyledListItemButton>
                    </ListItem>
                ))}
            </List>
        </StyledDrawer>
    );
};

export default Sidebar;
