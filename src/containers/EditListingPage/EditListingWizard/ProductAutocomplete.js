import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../../firebase/FirebaseContext';
import { collection, getDocs } from 'firebase/firestore';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const ProductAutocomplete = ({ selectedFamily, onProductChange, selectedProduct }) => {
  const { db } = useFirebase();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (selectedFamily) {
      const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, 'productFamilies', selectedFamily, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        console.log('Fetched products for family:', selectedFamily, productsData);
      };
      fetchProducts();
    }
  }, [db, selectedFamily]);

  return (
    <>
      <Autocomplete
        id="product-autocomplete"
        options={products}
        getOptionLabel={(option) => `${option.manufacturer} - ${option.model}`}
        value={products.find(product => product.id === selectedProduct?.id) || null}
        onChange={(event, newValue) => {
          onProductChange(newValue);  // Pass the entire product object
          console.log('Product selected:', newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Product" variant="outlined" fullWidth required />}
        disabled={!selectedFamily}
      />
      {/* <button onClick={() => console.log('selected family',  selectedFamily)}>Log selectedFamily</button> */}
      {/* <button onClick={() => console.log(products)}>Log Products</button> */}
    </>
  );
};

export default ProductAutocomplete;
