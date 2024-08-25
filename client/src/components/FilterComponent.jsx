import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormGroup, Button, Box } from '@mui/material';

const games = [
    'Werewolf',
    'Coup',
    'Uno',
    'Magic the Gathering',
    'เกมเศรษฐี',
    'Warhammer 40k',
    'Splendor',
    'Kill Team',
];

const FilterComponent = ({ onSearch }) => {
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedTime, setSelectedTime] = React.useState('');
    const [numberOfPeople, setNumberOfPeople] = React.useState('');
    const [selectedGames, setSelectedGames] = React.useState([]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
    };

    const handleNumberOfPeopleChange = (event) => {
        setNumberOfPeople(event.target.value);
    };

    const handleGameChange = (event) => {
        const game = event.target.name;
        setSelectedGames((prevSelectedGames) =>
            prevSelectedGames.includes(game)
                ? prevSelectedGames.filter((g) => g !== game)
                : [...prevSelectedGames, game]
        );
    };

    const handleSearchClick = () => {
        // Perform your search action here
        onSearch();
    };

    return (
        <Box
            id="filter-component"
            sx={{ display: 'flex', flexDirection: 'column', width: 300, gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
        >
            <TextField
                id="search-input"
                label="Search for User, Store or Game"
                variant="outlined"
                fullWidth
            />
            <TextField
                id="number-of-people-input"
                label="Number of People"
                variant="outlined"
                fullWidth
                value={numberOfPeople}
                onChange={handleNumberOfPeopleChange}
            />
            <TextField
                id="date-input"
                label="Select Date"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
                value={selectedDate}
                onChange={handleDateChange}
            />
            <TextField
                id="time-input"
                label="Select Time"
                type="time"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
                value={selectedTime}
                onChange={handleTimeChange}
            />
            <FormGroup id="game-checkbox-group">
                {games.map((game) => (
                    <FormControlLabel
                        key={game}
                        control={
                            <Checkbox
                                id={`game-checkbox-${game}`}
                                checked={selectedGames.includes(game)}
                                onChange={handleGameChange}
                                name={game}
                            />
                        }
                        label={game}
                    />
                ))}
            </FormGroup>
            <Button
                id="search-button"
                variant="contained"
                color="primary"
                onClick={handleSearchClick}
            >
                Search
            </Button>
        </Box>
    );
};

export default FilterComponent;
