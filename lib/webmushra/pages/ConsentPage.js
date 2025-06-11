/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

/**
* @class ConsentPage
* @property {string} title the page title
* @property {string} the page content
*/
function ConsentPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session) {
  this.pageManager = _pageManager;
  this.title = _pageConfig.name;
  this.content = _pageConfig.content;
  this.language = _pageConfig.language;
  this.mustConsent = _pageConfig.mustConsent;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.hearingIssue = false;
  this.participantData = null;
  this.session = _session;
}

/**
* Loads the page
* @memberof ConsentPage
*/
ConsentPage.prototype.load = function () {
  if (this.mustConsent == true){
    this.pageTemplateRenderer.lockNextButton();
  }
}

/**
* Returns the page title.
* @memberof ConsentPage
* @returns {string}
*/
ConsentPage.prototype.getName = function () {
  return this.title;
};

/**
* Validates the form inputs
* @memberof ConsentPage
* @returns {boolean}
*/
ConsentPage.prototype.validateForm = function () {
  const nameValid = $('#participant-name').val().trim() !== '';
  const ageValid = $('#participant-age').val().trim() !== '';
  const consentGiven = $('#radio-choice-accept')[0].checked;
  const hearingLoss = $('#hearing-loss-yes')[0].checked;
  const hearingAid = $('#hearing-aid-yes')[0].checked;
  
  this.hearingIssue = hearingLoss || hearingAid;
  
  if (this.hearingIssue) {
    $('#hearing-warning').show();
    return false;
  } else {
    $('#hearing-warning').hide();
    return nameValid && ageValid && consentGiven;
  }
};

/**
* Renders the page
* @memberof ConsentPage
*/
ConsentPage.prototype.render = function (_parent) {
  _parent.append(this.content);

  // Add participant information form
  var participantForm = $(`
    <div class='participant-info'>
      <div class='form-group'>
        <label for='participant-name'>Name (or pseudonym):</label>
        <input type='text' id='participant-name' class='form-control' required>
      </div>
      <div class='form-group'>
        <label for='participant-age'>Age:</label>
        <input type='number' id='participant-age' class='form-control' min='0' max='120' required>
      </div>
      
      <div class='screening-questions'>
        <h4>Hearing Screening</h4>
        
        <div class='form-group'>
          <p>Do you have any hearing loss?</p>
          <div class='radio-options'>
            <input type='radio' name='hearing-loss' id='hearing-loss-yes' value='yes'>
            <label for='hearing-loss-yes'>Yes</label>
            <input type='radio' name='hearing-loss' id='hearing-loss-no' value='no'>
            <label for='hearing-loss-no'>No</label>
          </div>
        </div>
        
        <div class='form-group'>
          <p>Do you use a hearing aid?</p>
          <div class='radio-options'>
            <input type='radio' name='hearing-aid' id='hearing-aid-yes' value='yes'>
            <label for='hearing-aid-yes'>Yes</label>
            <input type='radio' name='hearing-aid' id='hearing-aid-no' value='no'>
            <label for='hearing-aid-no'>No</label>
          </div>
        </div>
        
        <div id='hearing-warning' class='alert alert-danger' style='display:none;'>
          Unfortunately, you cannot participate in this study if you have hearing loss or use a hearing aid.
        </div>
        
        <div class='form-group'>
          <p>Do you regularly (monthly or more) play electric guitar?</p>
          <div class='radio-options'>
            <input type='radio' name='guitar-experience' id='guitar-yes' value='yes'>
            <label for='guitar-yes'>Yes</label>
            <input type='radio' name='guitar-experience' id='guitar-no' value='no' checked>
            <label for='guitar-no'>No</label>
          </div>
        </div>
      </div>
    </div>
  `);
  
  

  // Add consent radio buttons
  var radioChoice = $(`
    <div id='radio-choice' data-role='controlgroup' data-type='vertical'>
      <input type='radio' name='radio-choice' id='radio-choice-accept' value='accept'>
      <label for='radio-choice-accept'>I give consent.</label>
      <input type='radio' name='radio-choice' id='radio-choice-reject' value='reject'>
      <label for='radio-choice-reject'>I do not give consent.</label>
    </div>
  `);
  
  // Validation handler
  const validateHandler = (function() {
    if (this.validateForm()) {
      this.pageTemplateRenderer.unlockNextButton();
    } else {
      this.pageTemplateRenderer.lockNextButton();
    }
  }).bind(this);
  
  // Bind events
  radioChoice.find("input[type='radio']").bind("change", validateHandler);
  participantForm.find("input").on('input change', validateHandler);
  
  _parent.append(radioChoice);
  _parent.append(participantForm);
  return;
};

/**
* Saves the page
* @memberof ConsentPage
*/

ConsentPage.prototype.save = function () {
  // Collect all participant data
  this.participantData = {
    name: $('#participant-name').val().trim(),
    age: $('#participant-age').val().trim(),
    hearingLoss: $('#hearing-loss-yes')[0].checked ? 'yes' : 'no',
    hearingAid: $('#hearing-aid-yes')[0].checked ? 'yes' : 'no',
    playsGuitar: $('#guitar-yes')[0].checked ? 'yes' : 'no',
    consent: $('#radio-choice-accept')[0].checked ? 'accepted' : 'rejected'
  };
  
  // Store time spent (aligned with MushraPage)
  var endTime = performance.now();
  this.timeSpentOnPage = ((endTime - this.pageStartTime) / 1000).toFixed(3);
  
  // Don't return anything (like MushraPage.save)
};


ConsentPage.prototype.store = function () {
  if (!this.session.participant) {
    this.session.participant = {};
  }
  this.session.participant.consentData = this.participantData;
  this.session.participant.timeSpentOnConsent = this.timeSpentOnPage;
};