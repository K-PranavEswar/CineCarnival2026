import Movie from '../models/Movie.js';

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ showOrder: 1, createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch movies.' });
  }
};

export const createMovie = async (req, res) => {
  try {
    const { name, poster, description, duration, language, rating, ticketPrice, showTime, showOrder } = req.body;
    if (!name || !poster || !duration || !language) {
      return res.status(400).json({ message: 'Name, poster, duration and language are required.' });
    }
    const movie = await Movie.create({
      name,
      poster: poster || '',
      description: description || '',
      duration,
      language,
      rating: rating ?? 0,
      ticketPrice: ticketPrice ?? 69,
      showTime: showTime || '',
      showOrder: showOrder ?? 0,
    });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create movie.' });
  }
};
