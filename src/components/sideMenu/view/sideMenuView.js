import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
  Thumbnail, List, ListItem, Container,
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

// Components
import { IconButton } from '../..';

// Constants
import { default as MENU } from '../../../constants/sideMenuItems';

// Styles
import styles from './sideMenuStyles';

const DEFAULT_IMAGE = require('../../../assets/esteem.png');

class SideMenuView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      menuItems: [],
      isAddAccountIconActive: false,
    };
  }

  // Component Life Cycles

  componentWillMount() {
    const { isLoggedIn } = this.props;

    this.setState({
      menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
    });
  }

  _handleOnPressAddAccountIcon = () => {
    const { isAddAccountIconActive } = this.state;
    const { isLoggedIn, accounts } = this.props;
    if (!isAddAccountIconActive) {
      this.setState({ menuItems: accounts, isAddAccountIconActive: !isAddAccountIconActive });
    } else {
      this.setState({
        menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
        isAddAccountIconActive: !isAddAccountIconActive,
      });
    }
  };

  _getNameOfUser = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return '';
    const jsonMetadata = JSON.parse(currentAccount.json_metadata);
    if (
      Object.keys(jsonMetadata).length !== 0
      && jsonMetadata.constructor === Object
    ) {
      return jsonMetadata.profile.name;
    }
    return currentAccount.name;
  };

  _getUserAvatar = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return DEFAULT_IMAGE;
    const jsonMetadata = JSON.parse(currentAccount.json_metadata);
    if (
      Object.keys(jsonMetadata).length !== 0
      && currentAccount.json_metadata.constructor === Object
    ) {
      return { uri: jsonMetadata.profile.cover_image };
    }
    return DEFAULT_IMAGE;
  };

  // Component Functions

  render() {
    const { navigateToRoute, currentAccount, isLoggedIn } = this.props;
    const { menuItems, isAddAccountIconActive } = this.state;
    // TODO: Change dummy data
    return (
      <Container style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#357ce6', '#2d5aa0']}
          style={styles.headerView}
        >
          {isLoggedIn
          && (
          <View style={styles.headerContentView}>
            <Thumbnail style={styles.userAvatar} source={this._getUserAvatar()} />
            <View style={styles.userInfoView}>
              <Text style={styles.username}>{this._getNameOfUser()}</Text>
              <Text style={styles.usernick}>{`@${currentAccount.name}`}</Text>
            </View>
            <View style={styles.addAccountIconView}>
              {/* TODO: delete android name */}
              <IconButton
                name={isAddAccountIconActive ? 'arrow-dropup' : 'add-circle-outline'}
                androidName={isAddAccountIconActive ? 'md-arrow-dropup' : 'ios-add-circle-outline'}
                color="white"
                size={15}
                handleOnPress={() => this._handleOnPressAddAccountIcon()}
                style={styles.addAccountIcon}
              />
            </View>
          </View>
          )
          }
        </LinearGradient>
        <View style={styles.contentView}>
          <List
            itemDivider={false}
            dataArray={menuItems}
            renderRow={item => (
              <ListItem
                noBorder
                style={styles.listItem}
                onPress={() => navigateToRoute(item.route)}
              >
                {item.icon && <Icon style={styles.listItemIcon} name={item.icon} />}
                {item.image && <Thumbnail small style={styles.otherUserAvatar} source={item.image} />}
                <Text style={styles.listItemText}>{item.name}</Text>
              </ListItem>
            )}
          />
        </View>
      </Container>
    );
  }
}

export default SideMenuView;
