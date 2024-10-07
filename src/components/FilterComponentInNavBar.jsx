import React, { useState } from 'react';
import { TextField, Grid, Button, Box, Autocomplete } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { predefinedGames } from '../constants/gameList';

const FilterComponentInNavBar = ({ onFilter }) => {
    const [namegame, setNamegame] = useState('');
    const [username, setUsername] = useState('');
    const [meetDate, setMeetDate] = useState(null);
    const [meetTime, setMeetTime] = useState(null);
    const [numPeople, setNumPeople] = useState('');
    const [gameOption, setGameOption] = useState('');

    const handleFilterSubmit = () => {
        onFilter({ namegame, username, meetDate, meetTime, numPeople });
    };

    return (
        <Box sx={{ padding: '10px', backgroundColor: '#272727', borderRadius: '4px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                        fullWidth
                        value={gameOption}
                        onChange={(event, newValue) => {
                            if (newValue === 'Other') {
                                setGameOption('');
                                setFormValues((prevValues) => ({
                                    ...prevValues,
                                    name_games: customGameName,
                                }));
                            } else {
                                setGameOption(newValue || '');
                                setFormValues((prevValues) => ({
                                    ...prevValues,
                                    name_games: newValue || '',
                                }));
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            setCustomGameName(newInputValue);
                        }}
                        options={predefinedGames}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select or enter a board game"
                                variant="outlined"
                                sx={{ mb: 2 }}
                                inputProps={{
                                    ...params.inputProps,
                                    'data-testid': 'game-select',
                                    id: 'game-select',
                                }}
                            />
                        )}
                        getOptionLabel={(option) => option || ''}
                        id="game-autocomplete"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                        label="Meet Date"
                        value={meetDate}
                        onChange={(newValue) => setMeetDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TimePicker
                        label="Meet Time"
                        value={meetTime}
                        onChange={(newValue) => setMeetTime(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        label="Number of People"
                        type="number"
                        fullWidth
                        value={numPeople}
                        onChange={(e) => setNumPeople(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleFilterSubmit} fullWidth>
                        Search
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FilterComponentInNavBar;
