import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  label: string;
  theme?: "primary"
};

export default function Button({ label, theme }: Props) {
    if (theme === 'primary') {
        return (
          <View
            style={[
              styles.buttonContainer
            ]}>
            <Pressable
              style={[styles.button, { backgroundColor: '#fff' }]}
              onPress={() => alert('You pressed a button.')}>
              <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
            </Pressable>
          </View>
        );
    }
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 5,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});