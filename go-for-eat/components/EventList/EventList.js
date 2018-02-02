import React, { Component } from 'react';
import { View, ScrollView, Text, FlatList, SectionList, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import serverHost from '../../config/serverHost.js';
import { getNearbyEvents } from '../../actions';
import { Event } from '../Event';
import moment from 'moment';
import _ from 'lodash';
import s from './styles';

class EventList extends Component {
  constructor (props) {
    super(props);
    this.state = {
      lat: 41.3949187, //get from google
      lng: 2.1957668, //get from google
      dist: 100000, //get from google
      to: Math.floor(new Date(moment().endOf('day')).getTime()/1000),
      from: Math.floor(new Date().getTime()/1000),
    };
  }

  componentDidMount(){
    this.state.apiCall ? null :
      this.props.getNearbyEvents(this.state)
        .then(()=> this.setState({apiCall: true}));
  }

  loadMore = async () => {
    await this.setState({
      to: Math.floor(new Date(moment((this.state.to+100)*1000).endOf('day')).getTime()/1000),
      from: this.state.to,
    })
    this.props.getNearbyEvents(this.state)
  }

  render() {
    return  this.state.apiCall ? (
      <SectionList
        style={s.list}
        renderSectionHeader={({section}) => {return (
          <View style={s.section_header}>
            <Text style={s.section_header_text}> {moment(section.title * 1000).format('Do MMMM')} </Text>
          </View>);
        }}
        sections={this.props.events}
        renderItem={({ item }) => <Event key={item} eventID={item}/>}
        ItemSeparatorComponent={this.renderSeparator}
        keyExtractor={item => item}
        onEndReached={this.loadMore}
        onEndReachedThreshold={1}
      />
    ) : <Text>Loading</Text>;
  }

  renderFooter = () => {
    return (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator animating size="large"/>
      </View>
    )
  }

  renderSeparator = () => {
    return (
      <View
        style={{height: 1,width: "100%",backgroundColor: "#2ECC71",}}
      />
  )};
}

const mapStateToProps = (state) => ({
  events: state.pages.Home.events,
});

const mapDispatchToProps = (dispatch) => ({
  getNearbyEvents: (queryString) => dispatch(getNearbyEvents(queryString)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EventList);