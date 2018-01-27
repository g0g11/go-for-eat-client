import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { connect } from 'react-redux';
import { FacebookButton, GoogleButton } from '../../components/Buttons';
import serverHost from '../../config/serverHost.js';
import logo from '../../assets/logo/logo2x.png';
import styles from './styles';
import PropTypes from 'prop-types';
import { setUser } from '../../actions';
import { loginUser } from '../../actions';

class Login extends Component {
  static propTypes = {
    navigation: PropTypes.object
  };

  componentDidMount() {
    Expo.SecureStore.getItemAsync('state')
      .then(userData => {
        if (userData) {
          let user = JSON.parse(userData).authentication;
          if (user) {
            this.props.setUser(user)
            this.props.navigation.navigate('Home');
          }
        }
      });
  }

  loginGoogle = async () => {

    Expo.Google.logInAsync({
      iosClientId: '795597563248-aph6ms1e1f53i6ela2281hpcu09itjer.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    })
    .then(result => {
      if (result.type === 'success') {
        let data = {
          id: result.user.id,
          accessToken: result.accessToken,
          idToken: result.idToken,
          network: 'google'
        };
        this.props.serverAuth(data);
      } else {
        return {cancelled: true};
      }
    })
    .then(() => this.props.navigation.navigate('Home'))
    .catch(err => console.log(err));

  }

  loginFacebook = async () => {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('442248476177832', {
      permissions: ['public_profile', 'email', 'user_birthday'],
    });
    if (type === 'success') {
      return fetch(`https://graph.facebook.com/me?access_token=${token}`)
      .then(res => res.json())
      .then(data => {
        data.accessToken = token;
        data.network = 'facebook';
        const allowed = ['id', 'accessToken', 'network'];
        const filtered = Object.keys(data)
          .filter(key => allowed.includes(key))
          .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
          }, {});
        this.props.serverAuth(filtered);

      })
      .then(()=>this.props.navigation.navigate('Home'))
      .catch(err => console.log(err));
    }
  }

  render() {
    if (this.props.loading) {
      return (<Text>Loading!</Text>)}
    return (
      <View style={styles.login_container}>
        <View style={styles.login_logo}><Image source={logo}/></View>
        <Text style={styles.login_tagline}>
        Share your lunch with someone new,{'\n'} meet new people and create new contacts
        </Text>
        <FacebookButton loginFacebook={this.loginFacebook}/>
        <GoogleButton loginGoogle={this.loginGoogle}/>
      </View>
    );
  }
}


const mapStateToProps = (state) => ({
  loading: state.authentication.loading,
});

const mapDispatchToProps = (dispatch) => ({
  setUser: user => dispatch(setUser(user)),
  serverAuth: (data) => dispatch(loginUser(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);