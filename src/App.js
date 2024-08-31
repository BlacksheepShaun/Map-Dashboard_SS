import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';
import Select from 'react-select';
import ReactSlider from 'react-slider';

import { states } from './states'; 

mapboxgl.accessToken = process.env.REACT_APP_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10', // or any other mapbox style
      center: [-98.5795, 39.8283], // Centered in the USA
      zoom: 3.5
    });

    // Add layers for states when the map loads
    map.current.on('load', () => {
      const geoJsonForm = {
        'type': 'FeatureCollection',
        'features': states.map(element => ({
          'type': 'Feature',
          'properties': {
            'name': element.name
          },
          'geometry': {
            'type': 'Polygon',
            'coordinates': element.geometry
          }
        }))
      };

      map.current.addSource('states', { 'type': 'geojson', 'data': geoJsonForm });

      // Add a layer for fill
      map.current.addLayer({
        'id': 'state-fill',
        'type': 'fill',
        'source': 'states',
        'layout': {},
        'paint': {
          'fill-color': '#A6C11F',
          'fill-opacity': 0.5
        },
        'filter': ['==', 'name', ''] // Empty filter to hide initially
      });

      // Add a layer for outlines
      map.current.addLayer({
        'id': 'state-outline',
        'type': 'line',
        'source': 'states',
        'layout': {},
        'paint': {
          'line-color': '#000',
          'line-width': 2
        },
        'filter': ['==', 'name', ''] // Empty filter to hide initially
      });

      const popup = new mapboxgl.Popup();

      // Show popup on click
      map.current.on('click', 'state-fill', (e) => {
        const stateName = e.features[0].properties.name;
        popup
          .setLngLat(e.lngLat)
          .setHTML(stateName)
          .addTo(map.current);
      });

      // Change cursor to pointer when hovering over a state
      map.current.on('mouseenter', 'state-fill', () => {
        map.current.getCanvas().style.cursor = '';
      });

      // Revert cursor to default when not hovering
      map.current.on('mouseleave', 'state-fill', () => {
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });
    });
  }, []);

  function changeOpacity(value) {
    const opacity = parseInt(value) / 100; // Convert slider value to a 0-1 range
    map.current.setPaintProperty('state-fill', 'fill-opacity', opacity);
  }
  

  // Handle state selection
  function handleChange(selectedOption) {
    setSelectedState(selectedOption.value);

    // Filter map layer to show the selected state
    map.current.setFilter('state-fill', ['==', 'name', selectedOption.value]);
    map.current.setFilter('state-outline', ['==', 'name', selectedOption.value]);

    // Center the map on the selected state
    const selectedFeature = states.find(state => state.name === selectedOption.value);
    const coordinates = selectedFeature.geometry[0][0];
    map.current.flyTo({ center: coordinates, zoom: 6 });
  }

  // Dropdown options for all 50 states
  const options = states.map(state => ({
    value: state.name,
    label: state.name
  }));

  return (
    <div>
      <Select
        className='select-wrapper'
        value={options.find(option => option.value === selectedState)}
        onChange={handleChange}
        options={options}
        placeholder="Select a state"
      />

      <ReactSlider
      defaultValue={[50]}
      className="customSlider"
      thumbClassName="customSlider-thumb"
      trackClassName="customSlider-track"
      onChange={(value) => changeOpacity(value[0])}
      renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
      />
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
