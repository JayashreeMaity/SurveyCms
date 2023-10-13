import React, { useState, useEffect } from "react";

const EditEpisodeForm = ({ episodeId, onClose, onSubmit }) => {
    const [editedData, setEditedData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch episode data by ID here
        fetch(`http://3.6.200.239:8000/api/shows/${episodeId}`)
            .then((response) => response.json())
            .then((episode) => {
                setEditedData(episode.result.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching episode:', error);
                setLoading(false);
            });
    }, [episodeId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditedData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async () => {
        try {
            const response = await fetch(`http://3.6.200.239:8000/api/shows/${episodeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            if (response.ok) {
                console.log('Episode data updated successfully');
                onSubmit(editedData); // Pass the updated data back to the parent component
                onClose();
            } else {
                console.error('Error updating episode data:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating episode data:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="edit-form">
            <h2>Edit Episode</h2>
            <form>
                {/* Render input fields for episode details */}
                {/* Example: */}
                <input
                    type="text"
                    name="episode_name"
                    value={editedData.episode_name || ""}
                    onChange={handleInputChange}
                />
                {/* ... other input fields */}
                <button type="button" onClick={handleFormSubmit}>
                    Save Changes
                </button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default EditEpisodeForm;
