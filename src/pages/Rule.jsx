import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Rules = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{
                backgroundImage: 'url(/path/to/your/background/image.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Container
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: '2rem',
                    borderRadius: '8px',
                    maxWidth: '600px',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" color="white" gutterBottom>
                    Rules
                </Typography>
                <Typography variant="body1" color="white" paragraph>
                    1. ห้ามเสนอข้อคิดเห็นหรือเนื้อหาอันเป็นการวิพากษ์วิจารณ์หรือพาดพิงสถาบันกษัตริย์และราชวงศ์ เป็นอันขาด<br />
                    2. ห้ามเสนอข้อคิดเห็นหรือเนื้อหาที่ส่อไปในทางหยาบคาย ขำว่าร้าว เกินกว่าที่บรรทัดฐานของสังคมจะยอมรับได้<br />
                    3. ห้ามเสนอข้อคิดเห็นหรือเนื้อหาที่ส่อไปในทาง ลามก อนาจาร รุนแรง จาด<br />
                    4. ห้ามเสนอข้อคิดเห็นใดๆที่ส่อไปในทางดูหมิ่น ให้ได้รับการดูหมิ่นเกลียดชังจากบุคคลอื่น<br />
                    5. ห้ามเสนอข้อคิดเห็นที่เป็นการท้าทาย ชักจูง โดยมีเจตนาก่อให้เกิดการทะเลาะวิวาท หรือก่อให้เกิดความวุ่นวายขึ้น โดยจุมพอหวังความเดียวง่ายดังกล่าว ไม่เช่นการแสดงความคิดเห็นโดยเสริมธัญญอนุ พิจารณะทำ<br />
                    6. ห้ามเสนอข้อคิดเห็นที่ล่วงเห็น หรือวิพากษ์วิจารณ์ในทางเสียหายต่อ ศาสนา หรือคำสอนของศาสนาใดๆ ทุกศาสนา<br />
                    7. ห้ามใช้นามแฝงอันเป็นชื่อหรือของผู้อื่น โดยมีเจตนาทำให้สาธารณชนเข้าใจผิด และเจ้าของชื่ออันนี้ได้รับความเสียหายหรือสื่อมลพิษสื่อเสียหาย<br />
                    8. ห้ามเสนอข้อคิดเห็นอันอาจเป็นเหตุให้เกิดความขัดแย้งขึ้นในระหว่างสถานบันการศึกษา หรือระหว่างสังคมใดๆ<br />
                    9. ห้ามเสนอข้อมูลส่วนตัวของผู้อื่น เช่น อีเมลหรือหมายเลขโทรศัพท์ โดยเฉพาะอย่างยิ่งกรณีเบอร์โทรศัพท์
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="secondary"
                    sx={{ marginTop: '1rem' }}
                >
                    Return to Home
                </Button>
            </Container>
        </Box>
    );
}

export default Rules;
