// src/containers/ListingPage/ListingPageProductDetails.js

import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import css from './ListingPage.module.css';

const sortOrder = {
  product_type: 1,
  manufacturer: 2,
  year: 3,
  model: 4,
  fuel: 5,
  non_marking_tyres: 6,
  platform_height_m: 7,
  working_height_m: 8,
  platform_capacity_kg: 9,
  platform_extension_m: 10,
  platform_size: 11,
  maximum_lift_capacity_kg: 12,
  maximum_lift_height_m: 13,
  ground_clearance_m: 14,
  lift_capacity_at_full_height_kg: 15,
  lift_capacity_at_full_reach_kg: 16,
  maximum_forward_reach_m: 17,
  height_m: 18,
  length_m: 19,
  weight_with_forks_kg: 20,
  weight_kg: 21,
  width_m: 22,
  width_with_stabilizers_down_m: 23,
  indoor_use_only: 24,
  indoor_occupants: 25,
  outdoor_occupants: 26,
  design_registration: 27,
  double_checked: 28,
  operator_manual: 29,
  risk_assesment_manufacturer: 30,
  risk_assesments_hirer: 31,
  series: 32,
  swms: 33,
};


const hiddenAttributes = [
  'urls',
  'urls_1',
  'double_checked',
  'id',
  'family_id',
  'product_family',
  'brochure',
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
  }; ``
};

const ListingPageProductDetails = ({ productFamily, productId, publicData }) => {
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
        // Add publicData.year to productDetails object
        const updatedProductDetails = {
          ...data, // Original product details from Supabase
          year: publicData?.year, // Add year from publicData if available
        };
  
        setProductDetails(updatedProductDetails);
        console.log('Fetched and updated product details:', updatedProductDetails);
      }
    };
  
    if (productId) {
      fetchProductDetails();
    }
  }, [supabase, productFamily, productId, publicData]);
  

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
      {/* <button onClick={() => console.log('sortedEntries:', sortedEntries)}>Log sorted entries</button> */}
      <TableContainer className={css.productSpecs} component={Paper} style={{ marginBottom: '20px' }}>
        <Table aria-label="product details table">
          <TableBody>
            {sortedEntries.map(([key, value]) => {
              const { key: formattedKey, value: formattedValue } = formatAttributeWithUnits(key, value);
              return (
                <TableRow key={key} >
                  <TableCell component="th" scope="row" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                    <p className={css.text}>
                      {formattedKey}
                    </p>
                  </TableCell>
                  <TableCell align="right" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                    <p className={css.text}><strong>{formattedValue}</strong></p>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow key={'brochure'} >
              <TableCell component="th" scope="row" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                <p className={css.text}>
                  Brochure
                </p>
              </TableCell>
              <TableCell align="right" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                <a className={css.text} href={productDetails.brochure} target="_blank"><strong>Click to view</strong></a>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {/* <button onClick={() => console.log('publicData:', publicData)}>Log publicData</button>
      <button onClick={() => console.log('productDetails:', productDetails)}>Log productDetails</button> */}
    </>
  );
};

export default ListingPageProductDetails;
