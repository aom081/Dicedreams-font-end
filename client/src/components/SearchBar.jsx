import React, { useState } from 'react';
import {
    Box, Select, MenuItem, TextField, Button, InputBase, IconButton,
    Slide, useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';
import { predefinedGames } from '../constants/gameList';

const SearchBar = ({ onSearchComplete }) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [players, setPlayers] = useState(1);
    const isMobile = useMediaQuery('(max-width: 600px)');

    const handleSearch = () => {
        const searchData = {
            game: selectedGame,
            date,
            time,
            players
        };
        onSearchComplete(searchData);
        setSearchOpen(false); // Close the search dropdown after searching
    };

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <InputBase
                placeholder="Search games"
                inputProps={{ "aria-label": "search" }}
                sx={{
                    background: '#fff',
                    borderRadius: 2,
                    padding: '0 10px',
                    width: '250px',
                    height: '36px',
                }}
                onClick={() => setSearchOpen(!searchOpen)}
                endAdornment={
                    <IconButton onClick={() => setSearchOpen(!searchOpen)}>
                        <SearchIcon />
                    </IconButton>
                }
            />

            {/* Slide down search dropdown */}
            <Slide direction="down" in={searchOpen} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1,
                        backgroundColor: "#333",
                        padding: "10px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    <Select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Select a game' }}
                        sx={{ backgroundColor: '#fff', width: '100%' }}
                    >
                        <MenuItem value="" disabled>
                            Select a game
                        </MenuItem>
                        {predefinedGames.map((game, index) => (
                            <MenuItem key={index} value={game}>
                                {game}
                            </MenuItem>
                        ))}
                    </Select>

                    <DatePicker
                        label="Select Date"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        sx={{ backgroundColor: '#fff', width: '100%' }}
                    />

                    <TimePicker
                        label="Select Time"
                        value={time}
                        onChange={(newValue) => setTime(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        sx={{ backgroundColor: '#fff', width: '100%' }}
                    />

                    <TextField
                        label="Players"
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                        value={players}
                        onChange={(e) => setPlayers(e.target.value)}
                        sx={{ backgroundColor: '#fff', width: '100%' }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        sx={{ backgroundColor: 'crimson', color: 'white', width: '100%' }}
                    >
                        Search
                    </Button>
                </Box>
            </Slide>
        </Box>
    );
};

export default SearchBar;
