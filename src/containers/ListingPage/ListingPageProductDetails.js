// src/containers/ListingPage/ListingPageProductDetails.js

import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import css from './ListingPage.module.css';

const sortOrder = {
  product_type: 1,
  manufacturer: 2,
  model: 3,
  fuel: 4,
  non_marking_tyres: 5,
  platform_height_m: 6,
  working_height_m: 7,
  platform_capacity_kg: 8,
  platform_extension_m: 9,
  platform_size: 10,
  maximum_lift_capacity_kg: 11,
  maximum_lift_height_m: 12,
  ground_clearance_m: 13,
  lift_capacity_at_full_height_kg: 14,
  lift_capacity_at_full_reach_kg: 15,
  maximum_forward_reach_m: 16,
  height_m: 17,
  length_m: 18,
  weight_with_forks_kg: 19,
  weight_kg: 20,
  width_m: 21,
  width_with_stabilizers_down_m: 22,
  indoor_use_only: 23,
  indoor_occupants: 24,
  outdoor_occupants: 25,
  design_registration: 26,
  double_checked: 27,
  operator_manual: 28,
  risk_assesment_manufacturer: 29,
  risk_assesments_hirer: 30,
  series: 31,
  swms: 32,
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
    </>
  );
};

export default ListingPageProductDetails;
