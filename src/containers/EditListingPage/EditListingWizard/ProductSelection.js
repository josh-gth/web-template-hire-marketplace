// src/containers/EditListingPage/EditListingWizard/ProductSelection.js

import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../../supabase/SupabaseContext';
import { Stack, TextField, Autocomplete } from '@mui/material';

const ProductSelection = ({ onProductSelect, productFamily, productId, setProductData, changeProductIdField }) => {
  const { supabase } = useSupabase();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (productFamily) {
        const { data, error } = await supabase
          .from(productFamily)  // Use the actual table name
          .select('*')
          .eq('product_family', productFamily);
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data);
          // If productId is provided, set the selected product
          if (productId) {
            const selectedProduct = data.find(product => product.id === productId);
            if (selectedProduct) {
              setSelectedProduct(selectedProduct);
              setProductData(selectedProduct);
            }
          }
        }
      }
    };
    fetchProducts();
  }, [supabase, productFamily, productId, setProductData]);

  const handleProductChange = (event, newValue) => {
    if (newValue) {
      onProductSelect(newValue.id);
      changeProductIdField(newValue.id);
      setSelectedProduct(newValue);
      setProductData(newValue);
    }
  };

  return (
    <Stack spacing={5} sx={{ mb: 4 }}>
      <Autocomplete
        id="product-autocomplete"
        options={products}
        getOptionLabel={(option) => `${option.manufacturer} - ${option.model}`}
        value={selectedProduct}
        onChange={handleProductChange}
        renderInput={(params) => <TextField {...params} label="Product" variant="outlined" fullWidth required />}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.manufacturer} - {option.model}
          </li>
        )}
        disabled={!productFamily}
      />
    </Stack>
  );
};

export default ProductSelection;
