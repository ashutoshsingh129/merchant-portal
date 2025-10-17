import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Sidebar from '../Sidebar';

const StyledRoot = styled(Box)({
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f8fafc',
});

const MainContent = styled(Box, {
    shouldForwardProp: prop => prop !== 'sidebarOpen',
})<{ sidebarOpen: boolean }>(({ theme, sidebarOpen }) => ({
    flexGrow: 1,
    marginLeft: sidebarOpen ? '240px' : '64px',
    transition: theme.transitions.create('margin-left', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <StyledRoot>
            <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
            <MainContent sidebarOpen={sidebarOpen}>{children}</MainContent>
        </StyledRoot>
    );
};

export default Layout;
