import React from 'react';
import DashboardNav from '../layout/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
    searchValue?: string;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchValue, onSearch, searchPlaceholder }) => {
    const { user } = useAuth();

    return (
        <DashboardNav
            userRole={user?.user_type || "student"}
            userName={user?.full_name || user?.email || ""}
            searchValue={searchValue}
            onSearch={onSearch}
            searchPlaceholder={searchPlaceholder}
            hideGlobalSearch={onSearch ? true : false}
        />
    );
};
