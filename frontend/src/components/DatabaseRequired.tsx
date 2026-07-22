import { Outlet } from 'react-router-dom';
import { DatabaseConnectionModal } from './DatabaseConnectionModal';

export function DatabaseRequired() {
    return (
        <>
            <DatabaseConnectionModal />
            <Outlet />
        </>
    );
}
