use crate::{Error, mock::*};
use frame_support::{assert_ok, assert_noop};

#[test]
fn it_works_for_default_value() {
	new_test_ext().execute_with(|| {
		// Dispatch a signed extrinsic.
		assert_ok!(TemplateModule::do_something(Origin::signed(1), 42));
		// Read pallet storage and assert an expected result.
		assert_eq!(TemplateModule::something(), Some(42));
	});
}

#[test]
fn storing_contact_details_should_work() {
	new_test_ext().execute_with(|| {
		let details = ContactDetails{ username : Vec::from("GDixon"), email: Vec::from("graham@gdixon.co.uk"), referrals: Some(30), referralsNeeded: None };
		assert_ok!(TemplateModule::update_contact_details(Origin::signed(1), details.clone()));
		assert_eq!(TemplateModule::get_contact_details(), details);
	});
}

#[test]
fn storing_contact_with_enough_referrals() {
	new_test_ext().execute_with(|| {
		let details = ContactDetails{ username : Vec::from("GDixon"), email: Vec::from("graham@gdixon.co.uk"), referrals: Some(1), referralsNeeded: None};
		assert_ok!(TemplateModule::update_contact_details(Origin::signed(1), details.clone()));
		assert_eq!(TemplateModule::get_contact_details().referralsNeeded, Some(4));
	});
}

#[test]
fn correct_error_for_none_value() {
	new_test_ext().execute_with(|| {
		// Ensure the expected error is thrown when no value is present.
		assert_noop!(
			TemplateModule::cause_error(Origin::signed(1)),
			Error::<Test>::NoneValue
		);
	});
}
