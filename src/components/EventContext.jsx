import React, { createContext, useState } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
        {
            profilePic: "url_to_profile_picture1",
            username: "Vorapong J.",
            postTime: "30 เมษายน เวลา 21:59 น.",
            image: "G1.png",
            title: "UNO",
            date: "วันอาทิตย์ที่ 1 พฤษภาคม พ.ศ. 2567 เวลา 15.00 น.",
            content: "หาเพื่อนเล่นบอร์ดเกม UNO ชิวๆไม่ซีเรียส สี่-5 คน สถานที่: ร้าน outcast gaming",
            participants: 1,
            maxParticipants: 5,
        },
        {
            profilePic: "url_to_profile_picture2",
            username: "Jane D.",
            postTime: "2 พฤษภาคม เวลา 18:00 น.",
            image: "G2.jpg",
            title: "Werewolf",
            date: "วันพฤหัสบดีที่ 3 พฤษภาคม พ.ศ. 2567 เวลา 19.00 น.",
            content: "หาเพื่อนเล่น Werewolf กลางคืน สนุกสนาน",
            participants: 2,
            maxParticipants: 10,
        },
        {
            profilePic: "url_to_profile_picture3",
            username: "John S.",
            postTime: "5 พฤษภาคม เวลา 20:00 น.",
            image: "G3.webp",
            title: "Magic the Gathering",
            date: "วันเสาร์ที่ 6 พฤษภาคม พ.ศ. 2567 เวลา 14.00 น.",
            content: "Magic the Gathering commander game, new players welcome.",
            participants: 3,
            maxParticipants: 6,
        },
        {
            profilePic: "url_to_profile_picture4",
            username: "Emily R.",
            postTime: "7 พฤษภาคม เวลา 17:00 น.",
            image: "G4.avif",
            title: "Catan",
            date: "วันอาทิตย์ที่ 8 พฤษภาคม พ.ศ. 2567 เวลา 16.00 น.",
            content: "เล่นบอร์ดเกม Catan หาเพื่อนใหม่",
            participants: 4,
            maxParticipants: 4,
        },
    ]);

    const addEvent = (newEvent) => {
        setEvents((prevEvents) => [newEvent, ...prevEvents]);
    };

    return (
        <EventContext.Provider value={{ events, addEvent }}>
            {children}
        </EventContext.Provider>
    );
};
