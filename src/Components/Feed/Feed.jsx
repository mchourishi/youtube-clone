import moment from "moment";
import React, { useEffect, useState } from "react";
import "./Feed.css";
import { Link } from "react-router-dom";
import { API_KEY, value_converter } from "../../data";

const Feed = ({ category, searchQuery }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      let videoListURL;

      if (searchQuery) {
        // Search Query URL
        videoListURL = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${searchQuery}&type=video&key=${API_KEY}`;
      } else {
        // Category URL
        videoListURL = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${category}&key=${API_KEY}`;
      }
      const response = await fetch(videoListURL);
      const data = await response.json();

      if (searchQuery) {
        // For search results, we need to fetch video statistics in a separate call
        const videoIds = data.items.map((item) => item.id.videoId).join(",");
        const statsURL = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
        const statsResponse = await fetch(statsURL);
        const statsData = await statsResponse.json();

        // Combine search results with statistics
        const combinedData = data.items.map((item) => ({
          ...item,
          id: item.id.videoId,
          statistics: statsData.items.find(
            (stat) => stat.id === item.id.videoId
          )?.statistics || {
            viewCount: 0,
            likeCount: 0,
          },
        }));
        setData(combinedData);
      } else {
        setData(data.items);
      }
    } catch (err) {
      setError("Error fetching videos: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVideos();
  }, [category, searchQuery]);

  if (loading) return <div className="feed">Loading...</div>;
  if (error) return <div className="feed">{error}</div>;

  return (
    <div className="feed">
      {data.map((item, index) => {
        return (
          <Link
            key={index}
            to={`video/${item.snippet.categoryId || "search"}/${item.id}`}
            className="card"
          >
            <img src={item.snippet.thumbnails.medium.url} alt="" />
            <h2>{item.snippet.title}</h2>
            <h3>{item.snippet.channelTitle}</h3>
            <p>
              {value_converter(item.statistics.viewCount)} views &bull;{" "}
              {moment(item.snippet.publishedAt).fromNow()}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default Feed;
