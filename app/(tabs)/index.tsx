import { Text, View, StyleSheet, FlatList } from 'react-native';
import { Link } from 'expo-router'; 
//import {config, database} from '@/lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.footerContainer}>
        <Text style={styles.text}>Home Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  footerContainer: {
    flex: 1/4,
    alignItems: "center",
  },
});
