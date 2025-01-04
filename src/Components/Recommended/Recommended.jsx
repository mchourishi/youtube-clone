import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { API_KEY, value_converter } from "../../data";
import { Link } from "react-router-dom";

const Recommended = ({ categoryId }) => {
  const [apiData, setApiData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Fetching videos data
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=45&regionCode=US&videoCategoryId=${categoryId}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.items) {
        setApiData(data.items);
      } else {
        setError("No Video data found");
      }
    } catch (err) {
      setError("Error fetching vide data:" + err.message);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, []);

  if (error) {
    console.log(error);
  }

  return (
    <div className="recommended">
      {apiData.map((item, index) => {
        return (
          <Link
            to={`/video/${item.snippet.categoryId}/${item.id}`}
            key={index}
            className="side-video-list"
          >
            <img src={item.snippet.thumbnails.medium.url} alt="" />
            <div className="vid-info">
              <h4>{item.snippet.title}</h4>
              <p>{item.snippet.channelTitle}</p>
              <p>{value_converter(item.statistics.viewCount)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Recommended;
