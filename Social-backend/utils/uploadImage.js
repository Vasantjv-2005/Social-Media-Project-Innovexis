const uploadImage = async (imageUrl) => {
  try {
    return imageUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = uploadImage;