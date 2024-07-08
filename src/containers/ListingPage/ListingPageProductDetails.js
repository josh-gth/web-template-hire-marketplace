// src/containers/ListingPage/ListingPageProductDetails.js

import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import css from './ListingPage.module.css';

const sortOrder = {
  manufacturer: 2,
  model: 3,
  product_type: 1,
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
  'double_checked',
  'id',
  'family_id',
  'product_family',
]; 

const formatAttributeName = (name) => {
  return name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatAttributeWithUnits = (key, value) => {
  let formattedKey = key;
  let unit = '';

  if (key.endsWith('_m')) {
    formattedKey = key.slice(0, -2);
    unit = 'm';
  } else if (key.endsWith('_kg')) {
    formattedKey = key.slice(0, -3);
    unit = 'kg';
  }

  const formattedValue = value === null ? 'N/A' : `${value}${unit}`.trim();

  return {
    key: formatAttributeName(formattedKey),
    value: formattedValue,
  };
};

const ListingPageProductDetails = ({ productFamily, productId }) => {
  const { supabase } = useSupabase();
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      const { data, error } = await supabase
        .from(productFamily) // Ensure this table name matches your Supabase table
        .select('*')
        .eq('id', productId)
        .single();
        
      if (error) {
        console.error('Error fetching product details:', error);
      } else {
        setProductDetails(data);
        console.log('Fetched product details:', data);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [supabase, productFamily, productId]);

  const sortedEntries = Object.entries(productDetails)
    .filter(([key]) => !hiddenAttributes.includes(key)) // Filter out hidden attributes
    .sort((a, b) => {
      const aOrder = sortOrder[a[0]] || Number.MAX_SAFE_INTEGER;
      const bOrder = sortOrder[b[0]] || Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

  return (
    <>
      {/* <button onClick={() => console.log('product:', productDetails)}>Log product details</button> */}
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table aria-label="product details table">
          <TableBody>
            {sortedEntries.map(([key, value]) => {
              const { key: formattedKey, value: formattedValue } = formatAttributeWithUnits(key, value);
              return (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">
                    <p className={css.text}>
                      {formattedKey}
                    </p>
                  </TableCell>
                  <TableCell align="right">
                    <p className={css.text}><strong>{formattedValue}</strong></p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ListingPageProductDetails;
