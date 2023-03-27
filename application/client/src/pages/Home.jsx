import { useState, useEffect } from 'react';
import axios from "axios";
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';
import Filter from './Filter';

const Home = () => {

    const [restaurants, setRestaurants] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [searchRestaurants, setSearchRestaurants] = useState('');

    useEffect(() => {
        const getRestaurants = async () => {
            try {
                const response = await axios.get('/restaurants/getAllRestaurants');
                let rows = response.data;
                if (rows.length > 0) {
                    setRestaurants([...rows]);
                    setAllRestaurants([...rows]);
                } else {
                    console.log("No Restaurants to Show!");
                }
            } catch (err) {
                console.error(err);
            }
        };
        getRestaurants();
    }, []);

    const handleFilterChange = (cuisines) => {
        const checkedCuisines = cuisines.filter((cuisine) => cuisine.isChecked).map((cuisine) => cuisine.name);

        const filteredRestaurants = allRestaurants.filter((restaurant) => checkedCuisines.includes(restaurant.cuisine));

        setRestaurants(filteredRestaurants);
    };


    //search
    const handleSearch = (event) => {
        event.preventDefault();

        const fuse = new Fuse(allRestaurants, {
            keys: ["name", "cuisine"],
            threshold: 0.3,
        });

        const searchResults = fuse.search(searchRestaurants);
        const filteredRestaurants = searchResults.map((result) => result.item);

        setRestaurants(filteredRestaurants);
    };

    //Replace with below code if don't want to use fuse.js

    // const handleSearch = (event) => {
    //     event.preventDefault();
    //     const filteredRestaurants = allRestaurants.filter((restaurant) => {
    //         return (
    //             restaurant.name.toLowerCase().includes(searchRestaurants.toLowerCase()) ||
    //             restaurant.cuisine.toLowerCase().includes(searchRestaurants.toLowerCase())
    //         );
    //     });
    //     setRestaurants(filteredRestaurants);
    // };


    return (
        <div>
            <div className='browse'>
                <Filter handleFilterChange={handleFilterChange} />
                <form onSubmit={handleSearch}>
                    <div className="search-bar">
                        <input type="text" placeholder="Search for Restaurant or Cuisine..." value={searchRestaurants} onChange={(e) => setSearchRestaurants(e.target.value)} />
                        <button type="submit">
                            <img src={process.env.PUBLIC_URL + '/images/brand/search.png'} alt="Search" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="restaurant-container">
                {restaurants.map((restaurant) => {
                    return (
                        <Link to={`/restaurant/getMenu/${restaurant.id}`}>
                            <div className="restaurant-box">
                                <img src={restaurant.picture} alt={restaurant.name} />
                                <div className="restaurant-details">
                                    <h2>{restaurant.name}</h2>
                                    <p>$$$$$</p>
                                    <p>{restaurant.cuisine}</p>
                                    <h1>{restaurant.description}</h1>
                                    <p>
                                        {[...Array(5)].map((star, i) => {
                                            if (i < restaurant.rating) {
                                                return <img key={i} src={process.env.PUBLIC_URL + '/images/brand/star1.png'} alt="star" />;
                                            } else {
                                                return <img key={i} src={process.env.PUBLIC_URL + '/images/brand/star2.png'} alt="star" />;
                                            }
                                        })}
                                    </p>
                                    <p>{restaurant.est_delivery_time - 10} - {restaurant.est_delivery_time}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;