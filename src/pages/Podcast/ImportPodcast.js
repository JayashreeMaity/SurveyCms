// import React, { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import { useDropzone } from 'react-dropzone';
// import { Row, Col, Card, CardBody, FormGroup, Button, Label, Container } from "reactstrap";

// const ImportPodcast = () => {
//   const history = useHistory();
//   const [csvData, setCsvData] = useState([]);

//   const onDrop = (acceptedFiles) => {
//     const file = acceptedFiles[0];
//     const reader = new FileReader();

//     reader.onload = () => {
//       const csvText = reader.result;
//       const lines = csvText.split('\n');
//       // Assuming the first row of the CSV contains column headers
//       const headers = lines[0].split(',');
//       const extractedData = lines.slice(1).map((line) => {
//         const values = line.split(',');
//         const rowData = {};
//         headers.forEach((header, index) => {
//           rowData[header] = values[index];
//         });
//         return rowData;
//       });
//       setCsvData(extractedData);
//       history.push('/form', { csvData: extractedData });
//     };

//     reader.readAsText(file);
//   };

//   const { getRootProps, getInputProps } = useDropzone({
//     accept: '.csv',
//     onDrop,
//   });

//   return (
//     <React.Fragment>
//         <div className='page-content'>
//         <Container>
//         <div>
//       <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', textAlign: 'center' }}>
//         <input {...getInputProps()} />
//         <p>Drag & drop a CSV file here, or click to select one</p>
//       </div>
//     </div>
//         </Container>
//         </div>


//     </React.Fragment>

//   );
// };

// export default ImportPodcast;

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import xmlJs from 'xml-js';
import { xml2json, json2xml } from "xml-js";
// import XMLParser from 'react-xml-parser';
import axios from 'axios';
import { Container } from 'reactstrap';
import Search from 'antd/es/input/Search';
// import { Container, Input } from 'reactstrap';

const ImportPodcast = () => {
  const history = useHistory();
  const [xmlData, setXmlData] = useState([]);

  function RemoveJsonTextAttribute(value, parentElement) {
    try {
      var keyNo = Object.keys(parentElement._parent).length;
      var keyName = Object.keys(parentElement._parent)[keyNo - 1];
      parentElement._parent[keyName] = value;
    }
    catch (e) { }
  }

  const onSearch = (value) => {
    try {
      // const xmlFile =
      //   `<?xml version="1.0" encoding="UTF-8" ?>
      // <root>
      //   <show_name>Devotional show</show_name>
      //   <show_slug>devotional-show</show_slug>
      //   <show_subtitle>An amazing podcast</show_subtitle>
      //   <show_description>This is a sample show about interesting topics.</show_description>
      //   <show_type>Podcast</show_type>
      //   <update_frequency>5</update_frequency>
      //   <show_banner>https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_640.jpg</show_banner>
      //   <total_listens>12</total_listens>
      //   <show_total_durations>10:28:23 Hrs</show_total_durations>
      //   <trailer_audio>https://example.com/show_trailer_audio.mp4</trailer_audio>
      //   <show_language>English</show_language>
      //   <show_image>https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_640.jpg</show_image>
      //   <show_author>John Doe</show_author>
      //   <show_writer>Jane Smith</show_writer>
      //   <show_narrator>Alex Johnson</show_narrator>
      //   <show_podcaster>Samantha Lee</show_podcaster>
      //   <show_artist>Michael Brown</show_artist>
      //   <show_artist>Ed Sheren</show_artist>
      //   <show_access_type>Public</show_access_type>
      //   <show_publish_date>2023-08-10</show_publish_date>
      //   <show_publish_time>08:00 AM</show_publish_time>
      //   <show_rss_slug>horror-show</show_rss_slug>
      //   <show_credits>Music by John Smith</show_credits>
      //   <show_tags>Horror</show_tags>
      //   <show_tags>Science</show_tags>
      //   <category_id>64ccb31e080af0b9b8e50599</category_id>
      //   <show_comingsoon_image>https://example.com/comingsoon_image.jpg</show_comingsoon_image>
      //   <episodes>
      //     <episode_name>Episode 1: Introduction</episode_name>
      //     <episode_slug>episode-1-introduction</episode_slug>
      //     <episode_description>This is the first episode of the show.</episode_description>
      //     <episode_type>Audio</episode_type>
      //     <episode_image>https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_640.jpg</episode_image>
      //     <episode_audio>https://example.com/episode_audio.mp3</episode_audio>
      //     <episode_author>John Doe</episode_author>
      //     <episode_writer>Jane Smith</episode_writer>
      //     <episode_narrator>Alex Johnson</episode_narrator>
      //     <episode_podcaster>Samantha Lee</episode_podcaster>
      //     <episode_artist>Michael Brown</episode_artist>
      //     <episode_duration>00:54:23 Hrs</episode_duration>
      //     <left_duration>00:14:23 Hrs</left_duration>
      //     <episode_access_type>Public</episode_access_type>
      //     <episode_publish_date>2023-08-15</episode_publish_date>
      //     <episode_publish_time>10:00 AM</episode_publish_time>
      //     <show_id>64cbcbcc0b85c8ed669f41ae</show_id>
      //   </episodes>
      //   <episodes>
      //     <episode_name>Episode 2: Introduction</episode_name>
      //     <episode_slug>episode-2-introduction</episode_slug>
      //     <episode_description>This is the first episode of the show.</episode_description>
      //     <episode_type>Audio</episode_type>
      //     <episode_image>https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_640.jpg</episode_image>
      //     <episode_audio>https://example.com/episode_audio.mp3</episode_audio>
      //     <episode_author>John Doe</episode_author>
      //     <episode_writer>Jane Smith</episode_writer>
      //     <episode_narrator>Alex Johnson</episode_narrator>
      //     <episode_podcaster>Samantha Lee</episode_podcaster>
      //     <episode_artist>Michael Brown</episode_artist>
      //     <episode_duration>00:54:23 Hrs</episode_duration>
      //     <left_duration>00:14:23 Hrs</left_duration>
      //     <episode_access_type>Public</episode_access_type>
      //     <episode_publish_date>2023-08-15</episode_publish_date>
      //     <episode_publish_time>10:00 AM</episode_publish_time>
      //     <show_id>64cbcbcc0b85c8ed669f41ae</show_id>
      //   </episodes>
      // </root>`
      // const result1 = xml2json(xmlFile, { compact: true, spaces: 4, textFn: RemoveJsonTextAttribute });
      // const items = JSON.parse(result1);
      // console.log("items", items.root);
      // history.push('/form', { csvData: items.root })
      // console.log("get >>>>", items);
      fetch(value) // Replace with the URL or path to your XML data
        .then((response) => response.text())
        .then((xmlText) => {
          try {
            const jsonData = xmlJs.xml2json(xmlText, { compact: true, spaces: 4, textFn: RemoveJsonTextAttribute });
            const details = JSON.parse(jsonData);
            history.push('/form', { csvData: details.root })
            setXmlData(JSON.parse(jsonData));
          } catch (err) {
            console.log("Please provide a valid xml link!")
          }
        })
    } catch (err) {
      console.log("errr", err.message);
    }
  };

  // const onDrop = (acceptedFiles) => {
  //   const file = acceptedFiles[0];
  //   const reader = new FileReader();

  //   reader.onload = () => {
  //     const csvText = reader.result;
  //     console.log("csvText", csvText)
  //     const lines = csvText.split('\n');
  //     const headers = lines[0].split(',');
  //     // const lines = csvText.split('\n');
  //     // const headers = lines[0].split(',');
  //     const jsonData = lines.slice(1).map((line) => {
  //       const values = line.split(',');
  //       const row = {};

  //       headers.forEach((header, index) => {
  //         const value = values[index];
  //         if (header.includes(':')) {
  //           const [nestedKey, nestedProp] = header.split(':');
  //           if (!row[nestedKey]) {
  //             row[nestedKey] = {};
  //           }
  //           row[nestedKey][nestedProp] = value;
  //         } else {
  //           row[header] = value;
  //         }
  //       });

  //       return row;
  //     });
  //     setCsvData(jsonData);
  //     // setCsvData(extractedData);
  //     console.log("jsonData", jsonData)
  //     history.push('/form', { csvData: jsonData });
  //   };
  //   // const extractedData = lines.slice(1).map((line) => {
  //   //   console.log("line >>>>>", line);
  //   //   const values = line.split(',');
  //   //   const rowData = {};
  //   //   headers.forEach((header, index) => {
  //   //     // if (header === 'columnWithMultipleValues') {
  //   //     // Initialize the array if it doesn't exist
  //   //     if (!rowData[header]) {
  //   //       rowData[header] = [];
  //   //     }
  //   //     // Split values within the column by the appropriate separator
  //   //     // const columnValues = values[index]?.split(';'); // Change ';' to the actual separator
  //   //     // rowData[header].push(...columnValues);
  //   //     // } else {
  //   //     //   rowData[header] = values[index];
  //   //     // }
  //   //   });
  //   //   return rowData;
  //   // });

  //   // };

  //   reader.readAsText(file);
  // };

  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: '.csv',
  //   onDrop,
  // });

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container>
          {/* <div>
          <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <p>Drag & drop a CSV file here, or click to select one</p>
          </div>
        </div> */}
          <div>
            <Search
              addonBefore="https://"
              placeholder="input search text"
              allowClear
              size='large'
              onSearch={onSearch}
            />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ImportPodcast;
