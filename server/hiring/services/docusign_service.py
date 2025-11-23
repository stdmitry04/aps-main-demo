from docusign_esign import ApiClient, EnvelopesApi, EnvelopeDefinition, TemplateRole, Text, Tabs, RecipientViewRequest, TextCustomField, CustomFields
import os
import jwt
from datetime import datetime, timedelta
from pathlib import Path


class DocuSignService:
    def __init__(self):
        self.integration_key = os.getenv('DOCUSIGN_INTEGRATION_KEY')
        self.user_id = os.getenv('DOCUSIGN_USER_ID')
        self.account_id = os.getenv('DOCUSIGN_ACCOUNT_ID')
        self.template_id = os.getenv('DOCUSIGN_TEMPLATE_ID')

        # Handle relative or absolute path for private key
        private_key_path = os.getenv('DOCUSIGN_PRIVATE_KEY_PATH')
        if private_key_path:
            if not os.path.isabs(private_key_path):
                # If relative path, make it relative to the Django project root (server/)
                base_dir = Path(__file__).resolve().parent.parent.parent
                self.private_key_path = str(base_dir / private_key_path)
            else:
                self.private_key_path = private_key_path
        else:
            self.private_key_path = ''

        self.base_url = os.getenv('DOCUSIGN_BASE_URL', 'https://demo.docusign.net/restapi')

        self.api_client = ApiClient()
        self.api_client.host = self.base_url

    def _validate_config(self):
        """Validate that all required configuration is present"""
        if not self.integration_key:
            raise ValueError("DOCUSIGN_INTEGRATION_KEY is not set in environment variables")
        if not self.user_id:
            raise ValueError("DOCUSIGN_USER_ID is not set in environment variables")
        if not self.account_id:
            raise ValueError("DOCUSIGN_ACCOUNT_ID is not set in environment variables")
        if not self.template_id:
            raise ValueError("DOCUSIGN_TEMPLATE_ID is not set in environment variables")
        if not self.private_key_path:
            raise ValueError("DOCUSIGN_PRIVATE_KEY_PATH is not set in environment variables")
        if not os.path.exists(self.private_key_path):
            raise ValueError(f"DocuSign private key file not found at: {self.private_key_path}")

    def get_jwt_token(self):
        """Generate JWT token for authentication"""
        self._validate_config()

        with open(self.private_key_path, 'rb') as key_file:
            private_key = key_file.read()

        now = datetime.utcnow()

        # Use account-d.docusign.com for demo, account.docusign.com for production
        is_demo = 'demo' in self.base_url
        aud = 'account-d.docusign.com' if is_demo else 'account.docusign.com'

        payload = {
            'iss': self.integration_key,
            'sub': self.user_id,
            'aud': aud,
            'iat': now,
            'exp': now + timedelta(hours=1),
            'scope': 'signature impersonation'
        }

        return jwt.encode(payload, private_key, algorithm='RS256')

    def authenticate(self):
        """Authenticate with DocuSign using JWT"""
        self._validate_config()

        oauth_host = 'account-d.docusign.com' if 'demo' in self.base_url else 'account.docusign.com'

        with open(self.private_key_path, 'rb') as key_file:
            private_key = key_file.read()

        response = self.api_client.request_jwt_user_token(
            client_id=self.integration_key,
            user_id=self.user_id,
            oauth_host_name=oauth_host,
            private_key_bytes=private_key,
            expires_in=3600,
            scopes=['signature', 'impersonation']
        )

        self.api_client.set_default_header('Authorization', f'Bearer {response.access_token}')  # type: ignore

    def create_envelope_from_template(self, recipient_email, recipient_name, subject, tabs_data):
        """Create envelope from your existing template with field values"""
        self.authenticate()

        print("\n" + "="*80)
        print("DOCUSIGN ENVELOPE CREATION - DEBUG LOG")
        print("="*80)

        print(f"\n1. ENVELOPE CONFIG:")
        print(f"   Template ID: {self.template_id}")
        print(f"   Account ID: {self.account_id}")
        print(f"   Email Subject: {subject}")
        print(f"   Status: sent")

        print(f"\n2. RECIPIENT INFO:")
        print(f"   Role Name: Candidate")
        print(f"   Email: {recipient_email}")
        print(f"   Name: {recipient_name}")

        # Define HR fields that should be locked (pre-filled by HR)
        hr_locked_fields = {
            'districtName', 'candidateName', 'candidateEmail',
            'positionTitle', 'department', 'worksite',
            'salary', 'fte', 'startDate', 'offerDate', 'expirationDate',
            'benefit1', 'benefit2', 'benefit3', 'benefit4',
            'hrDirectorName', 'hrDirectorTitle'
        }

        print(f"\n3. CREATING TEXT TABS:")
        print(f"   Total tabs to process: {len(tabs_data.get('textTabs', []))}")

        # Build text tabs list
        text_tabs = []
        empty_fields = []

        for idx, tab_data in enumerate(tabs_data.get('textTabs', [])):
            tab_label = tab_data['tabLabel']
            tab_value = str(tab_data['value']) if tab_data.get('value') else ''

            # Track empty values
            if not tab_value or tab_value == 'None':
                empty_fields.append(tab_label)
                tab_value = ''  # Ensure it's empty string, not 'None'

            # Determine if HR field (locked) or candidate field (editable)
            is_locked = tab_label in hr_locked_fields

            # Create text tab
            text_tab = Text(
                tab_label=tab_label,
                value=tab_value,
                locked='true' if is_locked else 'false',
                required='false'  # Not required since pre-filling
            )

            text_tabs.append(text_tab)

            field_type = "LOCKED (HR)" if is_locked else "EDITABLE (Candidate)"
            status = "⚠️ EMPTY" if not tab_value else "✓"
            print(f"   [{idx+1}] {tab_label:20s} = '{tab_value:30s}' [{field_type}] {status}")

        if empty_fields:
            print(f"\n   ⚠️  WARNING: {len(empty_fields)} field(s) have empty values: {', '.join(empty_fields)}")

        print(f"\n4. FETCHING TEMPLATE INFO:")
        # Fetch template to see its configuration
        try:
            from docusign_esign import TemplatesApi
            templates_api = TemplatesApi(self.api_client)
            template = templates_api.get(self.account_id, self.template_id)

            print(f"   Template Name: {template.name if hasattr(template, 'name') else 'Unknown'}")
            print(f"   Template ID: {self.template_id}")

            # Check for custom fields (envelope-level)
            if hasattr(template, 'custom_fields') and template.custom_fields:
                print(f"\n   CUSTOM FIELDS (envelope-level):")
                if hasattr(template.custom_fields, 'text_custom_fields') and template.custom_fields.text_custom_fields:
                    print(f"      Text custom fields: {len(template.custom_fields.text_custom_fields)}")
                    for field in template.custom_fields.text_custom_fields[:5]:
                        print(f"         • Name: '{field.name}' | Value: '{getattr(field, 'value', 'N/A')}'")

            # Get template documents to check for merge/data fields
            try:
                documents = templates_api.list_documents(self.account_id, self.template_id)
                if documents and hasattr(documents, 'template_documents'):
                    print(f"\n   TEMPLATE DOCUMENTS: {len(documents.template_documents)}")
                    for doc in documents.template_documents:
                        print(f"      • Document: {doc.name} (ID: {doc.document_id})")

                        # Try to get document fields (data/merge fields)
                        try:
                            doc_fields = templates_api.list_document_fields(
                                self.account_id,
                                self.template_id,
                                doc.document_id
                            )
                            if doc_fields and hasattr(doc_fields, 'document_fields') and doc_fields.document_fields:
                                print(f"         Data/Merge Fields: {len(doc_fields.document_fields)}")
                                for field in doc_fields.document_fields[:5]:
                                    print(f"            - Name: '{field.name}' | Type: {getattr(field, 'field_type', 'N/A')}")
                        except Exception as e:
                            print(f"         Could not fetch document fields: {str(e)}")
            except Exception as e:
                print(f"   Could not fetch template documents: {str(e)}")

            # Get template recipients to see roles and tabs
            if hasattr(template, 'recipients') and template.recipients:
                if hasattr(template.recipients, 'signers') and template.recipients.signers:
                    print(f"\n   SIGNER ROLES ({len(template.recipients.signers)} total):")
                    for signer in template.recipients.signers:
                        print(f"\n      Role Name: '{signer.role_name}'")
                        print(f"      Recipient ID: {signer.recipient_id}")

                        # Check all tab types in template
                        if hasattr(signer, 'tabs') and signer.tabs:
                            tab_types = [
                                ('text_tabs', 'Text'),
                                ('number_tabs', 'Number'),
                                ('email_tabs', 'Email'),
                                ('date_tabs', 'Date'),
                                ('checkbox_tabs', 'Checkbox'),
                                ('sign_here_tabs', 'Signature'),
                                ('initial_here_tabs', 'Initial'),
                                ('full_name_tabs', 'Full Name'),
                                ('company_tabs', 'Company'),
                                ('title_tabs', 'Title'),
                            ]

                            found_tabs = False
                            for tab_attr, tab_name in tab_types:
                                if hasattr(signer.tabs, tab_attr):
                                    tab_list = getattr(signer.tabs, tab_attr)
                                    if tab_list:
                                        found_tabs = True
                                        print(f"      {tab_name} tabs: {len(tab_list)}")
                                        for tab in tab_list[:5]:  # Show first 5 of each type
                                            tab_label = getattr(tab, 'tab_label', 'N/A')
                                            print(f"         • Label: '{tab_label}'")

                            if not found_tabs:
                                print(f"      ⚠️  NO TABS FOUND IN TEMPLATE FOR THIS ROLE!")
                        else:
                            print(f"      ⚠️  NO TABS OBJECT IN TEMPLATE!")
                else:
                    print(f"   ⚠️  No signer roles in template")
            else:
                print(f"   ⚠️  No recipients in template")
        except Exception as e:
            print(f"   Could not fetch template: {str(e)}")

        print(f"\n5. BUILDING ENVELOPE:")
        print(f"   Total tabs to send: {len(text_tabs)}")

        # Create template role with tabs
        template_role = TemplateRole(
            email=recipient_email,
            name=recipient_name,
            role_name='Candidate',  # Must match your template role name
            tabs=Tabs(text_tabs=text_tabs)
        )

        # Create envelope definition as DRAFT first (so we can update form data)
        envelope_definition = EnvelopeDefinition(
            status='created',  # Draft mode
            template_id=self.template_id,
            email_subject=subject,
            template_roles=[template_role]
        )

        print(f"\n6. CREATING ENVELOPE AS DRAFT...")
        print(f"   API Host: {self.api_client.host}")

        # Create the envelope
        envelopes_api = EnvelopesApi(self.api_client)
        results = envelopes_api.create_envelope(self.account_id, envelope_definition=envelope_definition)

        print(f"   Envelope created in draft mode: {results.envelope_id}")

        # Update tab values (works in draft mode)
        print(f"\n   Updating tab values...")
        try:
            # Get recipients to find recipient ID
            recipients = envelopes_api.list_recipients(self.account_id, results.envelope_id)

            if recipients.signers and len(recipients.signers) > 0:
                recipient_id = recipients.signers[0].recipient_id
                print(f"   Recipient ID: {recipient_id}")

                # Build tabs with updated values
                updated_text_tabs = []
                for tab_data in tabs_data.get('textTabs', []):
                    text_tab = Text(
                        tab_label=tab_data['tabLabel'],
                        value=str(tab_data['value']) if tab_data.get('value') else '',
                        locked='true'  # Lock HR fields
                    )
                    updated_text_tabs.append(text_tab)
                    print(f"      • {tab_data['tabLabel']}: '{tab_data.get('value', '')}'")

                if updated_text_tabs:
                    # Update tabs for the recipient
                    tabs_to_update = Tabs(text_tabs=updated_text_tabs)

                    envelopes_api.update_tabs(
                        self.account_id,
                        results.envelope_id,
                        recipient_id,
                        tabs=tabs_to_update
                    )
                    print(f"   ✓ Tabs updated with {len(updated_text_tabs)} fields")

                    # Verify the update by fetching tabs back
                    print(f"\n   Verifying updated tabs...")
                    try:
                        updated_tabs = envelopes_api.list_tabs(self.account_id, results.envelope_id, recipient_id)
                        if updated_tabs.text_tabs:
                            print(f"   Text tabs after update ({len(updated_tabs.text_tabs)} total):")
                            for tab in updated_tabs.text_tabs:
                                status = "✓ FILLED" if tab.value else "✗ EMPTY"
                                print(f"      {status} - {tab.tab_label}: '{tab.value}'")
                        else:
                            print(f"   No text tabs found")
                    except Exception as verify_err:
                        print(f"   Could not verify tabs: {str(verify_err)}")
                else:
                    print(f"   No tabs to update")
            else:
                print(f"   ⚠️  No recipients found in envelope")
        except Exception as e:
            print(f"   ⚠️  Could not update tabs: {str(e)}")

        # Now send the envelope
        print(f"\n   Sending envelope...")
        try:
            from docusign_esign import Envelope
            envelope_update = Envelope(status='sent')
            envelopes_api.update(
                self.account_id,
                results.envelope_id,
                envelope=envelope_update
            )
            print(f"   ✓ Envelope sent successfully")
        except Exception as e:
            print(f"   ⚠️  Could not send envelope: {str(e)}")

        print(f"\n7. DOCUSIGN RESPONSE:")
        print(f"   Envelope ID: {results.envelope_id}")
        print(f"   Status: {results.status}")
        print(f"   Status Date/Time: {results.status_date_time}")
        if hasattr(results, 'envelope_uri'):
            print(f"   Envelope URI: {results.envelope_uri}")

        # Fetch envelope details to see what was actually stored
        print(f"\n8. FETCHING ENVELOPE DETAILS FROM DOCUSIGN...")
        try:
            envelope = envelopes_api.get_envelope(self.account_id, results.envelope_id)
            print(f"   Envelope fetched successfully")
            print(f"   Status: {envelope.status}")

            # Get all tabs from the recipient to see what DocuSign actually has
            print(f"\n9. FETCHING ALL RECIPIENT TABS (WHAT DOCUSIGN HAS)...")
            try:
                # Need to get recipients first
                recipients = envelopes_api.list_recipients(self.account_id, results.envelope_id)
                if recipients.signers and len(recipients.signers) > 0:
                    recipient_id = recipients.signers[0].recipient_id
                    tabs = envelopes_api.list_tabs(self.account_id, results.envelope_id, recipient_id)
                    print(f"   Tabs retrieved from DocuSign for recipient: {recipient_id}")

                    # Check ALL tab types
                    tab_types = [
                        ('text_tabs', 'TEXT'),
                        ('number_tabs', 'NUMBER'),
                        ('email_tabs', 'EMAIL'),
                        ('date_tabs', 'DATE'),
                        ('checkbox_tabs', 'CHECKBOX'),
                        ('radio_group_tabs', 'RADIO'),
                        ('list_tabs', 'LIST/DROPDOWN'),
                        ('sign_here_tabs', 'SIGNATURE'),
                        ('initial_here_tabs', 'INITIAL'),
                        ('full_name_tabs', 'FULL NAME'),
                        ('company_tabs', 'COMPANY'),
                        ('title_tabs', 'TITLE'),
                        ('formula_tabs', 'FORMULA'),
                        ('note_tabs', 'NOTE'),
                    ]

                    found_any = False
                    for tab_attr, tab_name in tab_types:
                        if hasattr(tabs, tab_attr):
                            tab_list = getattr(tabs, tab_attr)
                            if tab_list:
                                found_any = True
                                print(f"\n   {tab_name} TABS ({len(tab_list)} total):")
                                for tab in tab_list:
                                    tab_label = getattr(tab, 'tab_label', 'N/A')
                                    tab_value = getattr(tab, 'value', 'N/A')
                                    tab_locked = getattr(tab, 'locked', 'N/A')
                                    tab_id = getattr(tab, 'tab_id', 'N/A')
                                    print(f"      - Label: '{tab_label}' | Value: '{tab_value}' | Locked: {tab_locked} | ID: {tab_id}")

                    if not found_any:
                        print(f"\n   ⚠️  NO TABS OF ANY TYPE FOUND FOR THIS RECIPIENT!")
                else:
                    print(f"   ⚠️  No signers found in envelope")
            except Exception as e:
                print(f"   Could not fetch tabs: {str(e)}")

            # Get form data to see field values
            print(f"\n10. FETCHING FORM DATA (FIELD VALUES)...")
            form_data = envelopes_api.get_form_data(self.account_id, results.envelope_id)
            if hasattr(form_data, 'form_data') and form_data.form_data:
                print(f"   Form data retrieved:")
                for field in form_data.form_data:
                    if hasattr(field, 'name') and hasattr(field, 'value'):
                        print(f"   - {field.name}: '{field.value}'")
            else:
                print(f"   No form data available yet")
        except Exception as e:
            print(f"   Warning: Could not fetch envelope details: {str(e)}")

        # Get signing URL
        print(f"\n11. GENERATING SIGNING URL...")
        view_request = RecipientViewRequest()
        view_request.return_url = os.getenv('FRONTEND_URL', 'http://localhost:3000') + '/offers/signed'
        view_request.authentication_method = 'email'
        view_request.email = recipient_email
        view_request.user_name = recipient_name

        signing_view = envelopes_api.create_recipient_view(
            self.account_id,
            results.envelope_id,
            recipient_view_request=view_request
        )

        print(f"   Signing URL generated successfully")
        print(f"   URL length: {len(signing_view.url)} characters")
        print("="*80 + "\n")

        return {
            'envelopeId': results.envelope_id,
            'status': results.status,
            'signingUrl': signing_view.url
        }
