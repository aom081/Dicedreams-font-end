import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Typography } from '@mui/material';
import EventCard from './EventCard';

const SearchResults = () => {
    const location = useLocation();
    const { filterData } = location.state || {}; // Get the filter data passed via navigation

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFilteredData = async () => {
            try {
                // Build query params based on filterData
                const queryParams = new URLSearchParams(filterData).toString();

                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/search-events?${queryParams}`);
                setSearchResults(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching search results', error);
                setError('Failed to load search results. Please try again later.');
                setLoading(false);
            }
        };

        if (filterData) {
            fetchFilteredData();
        } else {
            setLoading(false);
        }
    }, [filterData]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <div>
            {searchResults.length > 0 ? (
                searchResults.map((event) => (
                    <EventCard
                        key={event.eventId}
                        userId={event.userId}
                        postTime={event.postTime}
                        image={event.image}
                        nameGames={event.nameGames}
                        dateMeet={event.dateMeet}
                        timeMeet={event.timeMeet}
                        detailPost={event.detailPost}
                        numPeople={event.numPeople}
                        maxParticipants={event.maxParticipants}
                        eventId={event.eventId}
                    />
                ))
            ) : (
                <Typography>No events found.</Typography>
            )}
        </div>
    );
};

export default SearchResults;
