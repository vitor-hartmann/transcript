import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  section: {
    margin: 10,
    padding: 10
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    color: '#2c5282'
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  }
});

const MinutesDocument = ({ data }) => {
  if (!data) return null;

  const {
    title = "Meeting Minutes",
    keyPoints = [],
    actionItems = [],
    timeline = []
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.section}>
            <Text style={styles.heading}>Key Points</Text>
            {keyPoints.length > 0 ? (
              keyPoints.map((point, index) => (
                <Text key={index} style={styles.text}>
                  • {point}
                </Text>
              ))
            ) : (
              <Text style={styles.text}>• No key points available</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Action Items</Text>
            {actionItems.length > 0 ? (
              actionItems.map((item, index) => (
                <Text key={index} style={styles.text}>
                  • {item.assignee || 'Unassigned'}: {item.task || 'No task specified'}
                </Text>
              ))
            ) : (
              <Text style={styles.text}>• No action items available</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Project Timeline</Text>
            {timeline.length > 0 ? (
              timeline.map((item, index) => (
                <Text key={index} style={styles.text}>
                  • {item.period || 'No period specified'}: {item.description || 'No description available'}
                </Text>
              ))
            ) : (
              <Text style={styles.text}>• No timeline items available</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MinutesDocument; 