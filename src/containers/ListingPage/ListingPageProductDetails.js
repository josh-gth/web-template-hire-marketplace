// ListingPageProductDetails.js
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../firebase/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import css from './ListingPage.module.css';


const sortOrder = {
  manufacturer: 1,
  model: 2,
  product_family: 3,
  product_type: 4,
  maximum_lift_capacity: 5,
  maximum_lift_height: 6,
  ground_clearance: 7,
  lift_capacity_at_full_height: 8,
  lift_capacity_at_full_reach: 9,
  maximum_forward_reach: 10,
  overall_height: 11,
  overall_length: 12,
  overall_weight_with_forks: 13,
  overall_width: 14,
  width_with_stabilizers_down: 15,
  design_registration: 16,
  double_checked: 17,
  operator_manual: 18,
  risk_assesment_manufacturer: 19,
  risk_assesments_hirer: 20,
  series: 21,
  swms: 22,
  brochure: 23,
};

const hiddenAttributes = [
  'urls',
  'urls_1',
  'double_checked'
];

const formatAttributeName = (name) => {
  return name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ListingPageProductDetails = ({ productFamily, productId }) => {
  const { db } = useFirebase();
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      const docRef = doc(db, `productFamilies/${productFamily}/products`, productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProductDetails(docSnap.data());
        console.log('Fetched product details:', docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [db, productFamily, productId]);

  const sortedEntries = Object.entries(productDetails)
    .filter(([key]) => !hiddenAttributes.includes(key)) // Filter out hidden attributes
    .sort((a, b) => {
      const aOrder = sortOrder[a[0]] || Number.MAX_SAFE_INTEGER;
      const bOrder = sortOrder[b[0]] || Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

  return (
    <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
      <Table aria-label="product details table">
        {/* <TableHead>
          <TableRow>
            <TableCell>Attribute</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead> */}
        <TableBody>
          {sortedEntries.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                <p className={css.text}>
                {formatAttributeName(key)}
                </p>
              </TableCell>
              <TableCell align="right" > <p className={css.text}><strong>{value.toString()}</strong></p></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListingPageProductDetails;
