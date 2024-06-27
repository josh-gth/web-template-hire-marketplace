import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../../firebase/FirebaseContext';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ProductAutocomplete from './ProductAutocomplete'; // Import the new component
import { Stack } from '@mui/material';

const ProductSelection = ({ onProductSelect, productId, productFamily }) => {
  const { db } = useFirebase();
  const [productFamilies, setProductFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProductFamilies = async () => {
      const querySnapshot = await getDocs(collection(db, 'productFamilies'));
      const families = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductFamilies(families);
      // console.log('Fetched product families:', families);
    };

    fetchProductFamilies();
  }, [db]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (productFamily && productId) {
        try {
          const productRef = doc(db, `productFamilies/${productFamily}/products/${productId}`);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const productData = productSnap.data();
            setSelectedFamily(productFamily);
            setSelectedProduct({ id: productId, ...productData });
            onProductSelect(productId, productFamily);
            console.log('Fetched product data:', { id: productId, ...productData });
          } else {
            console.log('No such product document!', productFamily, productId);
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      }
    };

    fetchProductData();
  }, [db, productFamily, productId, onProductSelect]);

  const handleFamilyChange = event => {
    setSelectedFamily(event.target.value);
    setSelectedProduct(null); // Clear selected product when changing family
    console.log('Selected family changed:', event.target.value);
  };

  const handleProductChange = product => {
    onProductSelect(product.id, selectedFamily);
    setSelectedProduct(product);
  };

  return (
    <Stack spacing={5} sx={{ mb: 4}}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="product-family-select-label">Product Family</InputLabel>
        <Select
          labelId="product-family-select-label"
          id="productFamily"
          value={selectedFamily}
          label="Product Family"
          onChange={handleFamilyChange}
          required
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {productFamilies.map(family => (
            <MenuItem key={family.id} value={family.id}>{family.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* <button onClick={() => console.log('families', productFamilies)}>Log Families</button> */}

      <ProductAutocomplete
        selectedFamily={selectedFamily}
        selectedProduct={selectedProduct}
        onProductChange={handleProductChange}
      />
      </Stack>
  );
};

export default ProductSelection;
