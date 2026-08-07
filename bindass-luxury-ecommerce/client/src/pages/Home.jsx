import React from 'react';
import DynamicPage from '../components/DynamicPage';

const Home = () => {
    return (
        <DynamicPage 
            pageKey="home" 
            title="Home" 
            description="Experience the intersection of high-fashion luxury and athletic energy. Shop the latest collections from BiNDAAS!"
        />
    );
};

export default Home;