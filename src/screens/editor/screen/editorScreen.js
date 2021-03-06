import React, { Component } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Components
import {
  BasicHeader,
  TitleArea,
  TagArea,
  TagInput,
  SummaryArea,
  PostForm,
  MarkdownEditor,
} from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';

class EditorScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isFormValid: false,
      isPreviewActive: false,
      wordsCount: null,
      isRemoveTag: false,
      fields: {
        title: (props.draftPost && props.draftPost.title) || '',
        body: (props.draftPost && props.draftPost.body) || '',
        tags: (props.draftPost && props.draftPost.tags) || [],
        isValid: false,
      },
    };
  }

  // Component Life Cycles
  UNSAFE_componentWillReceiveProps = async nextProps => {
    const { draftPost, isUploading } = this.props;
    if (nextProps.draftPost && draftPost !== nextProps.draftPost) {
      await this.setState(prevState => ({
        fields: {
          ...prevState.fields,
          ...nextProps.draftPost,
        },
      }));
    }

    if (isUploading !== nextProps) {
      this._handleFormUpdate();
    }
  };

  // Component Functions
  _initialFields = () => {
    const { initialEditor } = this.props;

    this.setState({
      fields: {
        title: '',
        body: '',
        tags: [],
        isValid: false,
      },
      isRemoveTag: true,
    });

    if (initialEditor) {
      initialEditor();
    }
  };

  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive });
  };

  _setWordsCount = content => {
    const _wordsCount = getWordsCount(content);
    const { wordsCount } = this.state;

    if (_wordsCount !== wordsCount) {
      this.setState({ wordsCount: _wordsCount });
    }
  };

  _handleOnSaveButtonPress = () => {
    const { saveDraftToDB } = this.props;
    const { fields } = this.state;

    saveDraftToDB(fields);
  };

  _saveCurrentDraft = fields => {
    const { saveCurrentDraft } = this.props;

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      saveCurrentDraft(fields);
    }, 300);
  };

  _handleOnSubmit = () => {
    const { handleOnSubmit } = this.props;
    const { fields } = this.state;

    if (handleOnSubmit) {
      handleOnSubmit({ fields });
    }
  };

  _handleIsFormValid = bodyText => {
    const { fields } = this.state;
    const { isReply } = this.props;
    let isFormValid;

    if (isReply) {
      isFormValid = get(fields, 'body').length > 0;
    } else {
      isFormValid =
        get(fields, 'title', '') &&
        get(fields, 'title', '').length < 255 &&
        (get(fields, 'body', '') || (bodyText && bodyText > 0)) &&
        get(fields, 'tags', null) &&
        get(fields, 'tags', null).length < 10;
    }

    this.setState({ isFormValid });
  };

  _handleFormUpdate = (componentID, content) => {
    const { handleFormChanged } = this.props;
    const { fields: _fields } = this.state;
    const fields = { ..._fields };

    if (componentID === 'body') {
      fields.body = content;
    } else if (componentID === 'title') {
      fields.title = content;
    } else if (componentID === 'tag-area') {
      fields.tags = content;
    }

    if (
      get(fields, 'body', '').trim() !== get(_fields, 'body', '').trim() ||
      get(fields, 'title', '').trim() !== get(_fields, 'title', '').trim() ||
      get(fields, 'tags') !== get(_fields, 'tags')
    ) {
      handleFormChanged();
      this._saveCurrentDraft(fields);
    }

    this.setState({ fields });

    this._handleIsFormValid();
  };

  _handleOnTagAdded = async tags => {
    const { fields: _fields } = this.state;
    const _tags = tags; //.filter(tag => tag && tag !== ' ');
    const __tags = _tags.map(t => t.toLowerCase());
    const __fields = { ..._fields, tags: [...__tags] };
    this.setState({ fields: __fields, isRemoveTag: false }, () => {
      this._handleFormUpdate('tag-area', __fields.tags);
    });
  };

  render() {
    const { fields, isPreviewActive, wordsCount, isFormValid, isRemoveTag } = this.state;
    const {
      handleOnImagePicker,
      intl,
      isDraftSaved,
      isDraftSaving,
      isEdit,
      isLoggedIn,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
      handleOnBackPress,
      handleDatePickerChange,
    } = this.props;
    const rightButtonText = intl.formatMessage({
      id: isEdit ? 'basic_header.update' : isReply ? 'basic_header.reply' : 'basic_header.publish',
    });

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
          handleDatePickerChange={date => handleDatePickerChange(date, fields)}
          handleOnBackPress={handleOnBackPress}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          handleOnSubmit={this._handleOnSubmit}
          isDraftSaved={isDraftSaved}
          isDraftSaving={isDraftSaving}
          isEdit={isEdit}
          isFormValid={isFormValid}
          isHasIcons
          isLoading={isPostSending || isUploading}
          isLoggedIn={isLoggedIn}
          isPreviewActive={isPreviewActive}
          isReply={isReply}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          rightButtonText={rightButtonText}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        >
          {isReply && !isEdit && <SummaryArea summary={post.summary} />}
          {!isReply && (
            <TitleArea value={fields.title} componentID="title" intl={intl} autoFocus={true} />
          )}
          {!isReply && !isPreviewActive && (
            <TagInput
              value={fields.tags}
              componentID="tag-area"
              intl={intl}
              handleTagChanged={this._handleOnTagAdded}
            />
          )}
          {!isReply && isPreviewActive && (
            <TagArea
              draftChips={fields.tags.length > 0 ? fields.tags : null}
              componentID="tag-area"
              intl={intl}
            />
          )}
          <MarkdownEditor
            componentID="body"
            draftBody={fields && fields.body}
            handleOnTextChange={this._setWordsCount}
            handleFormUpdate={this._handleFormUpdate}
            handleIsFormValid={this._handleIsFormValid}
            isFormValid={isFormValid}
            handleOpenImagePicker={handleOnImagePicker}
            intl={intl}
            uploadedImage={uploadedImage}
            initialFields={this._initialFields}
            isReply={isReply}
            isLoading={isPostSending || isUploading}
          />
        </PostForm>
      </View>
    );
  }
}

export default injectIntl(EditorScreen);
