import { Text, View, StyleSheet } from 'react-native';
import Button from '@/components/button';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.footerContainer}>
        <Button label="Log In" theme="primary"></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  footerContainer: {
    flex: 1/7,
    alignItems: "center",
  },
});
