import { useState, useEffect, useCallback } from 'react';
import awsServices from '../assets/aws-services.json';

export const useServiceSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const searchServices = useCallback((term) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        const results = Object.keys(awsServices)
            .filter(service =>
                service.toLowerCase().includes(term.toLowerCase())
            )
            .map(service => ({
                name: service,
                icon: awsServices[service]
            }));

        setSearchResults(results);
    }, []);

    useEffect(() => {
        searchServices(searchTerm);
    }, [searchTerm, searchServices]);

    return { searchTerm, setSearchTerm, searchResults };
};
