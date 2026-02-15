import Theatre from '../models/Theatre.js';
import Movie from '../models/Movie.js';

export const getTheatresByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const theatres = await Theatre.find({ movieId }).populate('movieId', 'name');
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch theatres.' });
  }
};

export const createTheatre = async (req, res) => {
  try {
    const { name, movieId, seats } = req.body;
    if (!name || !movieId || !seats?.length) {
      return res.status(400).json({ message: 'Name, movieId and seats (2D array) are required.' });
    }
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }
    const flatSeats = seats.flat();
    const theatre = await Theatre.create({
      name,
      movieId,
      seats,
      bookedSeats: [],
    });
    res.status(201).json(theatre);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create theatre.' });
  }
};
