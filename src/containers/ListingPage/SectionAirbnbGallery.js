import React, { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import css from './ListingPage.module.css';

const GalleryContainer = styled.div`
  position: relative;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  gap: 10px; /* Add padding between images */
  max-width: 100vw;
    @media (max-width: 768px) {
    max-width: calc(100vw - 24px);
    margin: 12px;
  }
`;

const MainImage = styled.div`
  flex: 1 1 50%;
  img {
    width: 100%;
    height: auto;
  }
`;

const Thumbnails = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Add padding between images */
  img {
    width: 100%;
    height: auto;
    cursor: pointer;
  }
`;

const ThumbnailItem = styled.div`
  flex: 1 1 calc(50% - 10px); /* For 2x2 grid */
  img {
    width: 100%;
    height: auto;
  }
`;

const ViewAllButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 10px;
  background: rgba(51, 51, 51, 0.8); /* Semi-transparent background */
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px; /* Optional: add some border-radius for better aesthetics */
  z-index: 1;
`;

const SectionAirbnbGallery = props => {
  const { listing, variantPrefix } = props;
  const images = listing.images;
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const renderThumbnails = (lessThanFive) => {
    return images.slice(lessThanFive ? 0 : 1, lessThanFive ? 2 : 5).map((image, index) => (
      <ThumbnailItem key={index} lessThanFive={lessThanFive}>
        <img
          src={image.attributes.variants[variantPrefix].url}
          alt={`Thumbnail ${index + 1}`}
          onClick={() => openLightbox(lessThanFive ? index : index + 1)}
        />
      </ThumbnailItem>
    ));
  };

  const lessThanFive = images.length < 5;

  return (
    <div className={css.productGallery} data-testid="carousel">
      <GalleryContainer lessThanFive={lessThanFive}>
        {lessThanFive ? (
          renderThumbnails(true)
        ) : (
          <>
            <MainImage>
              <img
                src={images[0].attributes.variants[variantPrefix].url}
                alt="Main"
                onClick={() => openLightbox(0)}
              />
            </MainImage>
            <Thumbnails>
              {renderThumbnails(false)}
            </Thumbnails>
            {images.length > 5 && (
              <ViewAllButton onClick={() => openLightbox(0)}>
                Show all photos
              </ViewAllButton>
            )}
          </>
        )}
      </GalleryContainer>
      {isOpen && (
        <Lightbox
          mainSrc={images[photoIndex].attributes.variants[variantPrefix].url}
          nextSrc={images[(photoIndex + 1) % images.length].attributes.variants[variantPrefix].url}
          prevSrc={images[(photoIndex + images.length - 1) % images.length].attributes.variants[variantPrefix].url}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
        />
      )}
    </div>
  );
};

SectionAirbnbGallery.propTypes = {
  listing: PropTypes.shape({
    images: PropTypes.arrayOf(
      PropTypes.shape({
        attributes: PropTypes.shape({
          variants: PropTypes.object.isRequired,
        }).isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
  variantPrefix: PropTypes.string.isRequired,
};

export default SectionAirbnbGallery;
