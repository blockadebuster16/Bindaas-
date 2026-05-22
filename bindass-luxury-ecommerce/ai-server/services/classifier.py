"""
Hierarchical ONNX Classifier (CUDA Optimized)
=============================================
Uses ONNX Runtime with CUDA execution provider for ultra-fast 
inference offloaded to the GPU.
"""
import onnxruntime as ort
import numpy as np
from dataclasses import dataclass
from typing import Optional
from pathlib import Path

@dataclass
class ClassificationResult:
    domain: str
    intent: str
    confidence: float

# Label mappings for numeric outputs (Stage 2)
BUSINESS_LABELS = [
    "restaurant_reviews","nutrition_info","account_blocked","oil_change_how","time","weather","redeem_rewards",
    "interest_rate","gas_type","accept_reservations","smart_home","user_name","report_lost_card","repeat",
    "whisper_mode","what_are_your_hobbies","order","jump_start","schedule_meeting","meeting_schedule",
    "freeze_account","what_song","meaning_of_life","restaurant_reservation","traffic","make_call","text",
    "bill_balance","improve_credit_score","change_language","no","measurement_conversion","timer",
    "flip_coin","do_you_have_pets","balance","tell_joke","last_maintenance","exchange_rate","uber",
    "car_rental","credit_limit","oos","shopping_list","expiration_date","routing","meal_suggestion",
    "tire_change","todo_list","card_declined","rewards_balance","change_accent","vaccines","reminder_update",
    "food_last","change_ai_name","bill_due","who_do_you_work_for","share_location","international_visa",
    "calendar","translate","carry_on","book_flight","insurance_change","todo_list_update","timezone",
    "cancel_reservation","transactions","credit_score","report_fraud","spending_history","directions",
    "spelling","insurance","what_is_your_name","reminder","where_are_you_from","distance","payday",
    "flight_status","find_phone","greeting","alarm","order_status","confirm_reservation","cook_time",
    "damaged_card","reset_settings","pin_change","replacement_card_duration","new_card","roll_dice",
    "income","taxes","date","who_made_you","pto_request","tire_pressure","how_old_are_you","rollover_401k",
    "pto_request_status","how_busy","application_status","recipe","calendar_update","play_music","yes",
    "direct_deposit","credit_limit_change","gas","pay_bill","ingredients_list","lost_luggage","goodbye",
    "what_can_i_ask_you","book_hotel","are_you_a_bot","next_song","change_speed","plug_type","maybe","w2",
    "oil_change_when","thank_you","shopping_list_update","pto_balance","order_checks","travel_alert",
    "fun_fact","sync_device","schedule_maintenance","apr","transfer","ingredient_substitution","calories",
    "current_location","international_fees","calculator","definition","next_holiday","update_playlist",
    "mpg","min_payment","change_user_name","restaurant_suggestion","travel_notification","cancel","pto_used",
    "travel_suggestion","change_volume"
]

SOCIAL_LABELS = [
    "cancel_order", "change_order", "change_shipping_address", "check_cancellation_fee",
    "check_invoice", "check_payment_methods", "check_refund_policy", "complaint",
    "contact_customer_service", "contact_human_agent", "create_account", "delete_account",
    "delivery_options", "delivery_period", "edit_account", "get_invoice", "get_refund",
    "newsletter_subscription", "payment_issue", "place_order", "recover_password",
    "registration_problems", "review", "set_up_shipping_address", "switch_account",
    "track_order", "track_refund"
]

class HierarchicalClassifier:
    def __init__(
        self,
        router_path: str,
        social_path: str,
        business_path: str,
    ):
        # Prefer CUDA if available
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
        
        # We handle .joblib vs .onnx path conversion if needed
        # But for this optimization, we assume .onnx exists
        router_onnx = router_path.replace("_svm.joblib", ".onnx")
        social_onnx = social_path.replace("_svm.joblib", ".onnx")
        business_onnx = business_path.replace("_svm.joblib", ".onnx")

        print(f"[...] Loading ONNX models with {ort.get_device()} support...")
        
        self.router = ort.InferenceSession(router_onnx, providers=providers)
        self.social = ort.InferenceSession(social_onnx, providers=providers)
        self.business = ort.InferenceSession(business_onnx, providers=providers)

        # Domain mapping
        self.router_labels = ["social", "business"]

    def predict(self, feature_vector) -> ClassificationResult:
        """
        Run 2-stage hierarchical classification using ONNX Runtime.
        """
        # Convert sparse vector to dense float32 numpy for ONNX
        # LinearSVC models exported via skl2onnx expect [N, Features]
        X = feature_vector.toarray().astype(np.float32)

        # Stage 1: Router
        router_inputs = {self.router.get_inputs()[0].name: X}
        domain_idx = self.router.run(None, router_inputs)[0][0]
        
        # Map domain index to string if numeric
        if isinstance(domain_idx, (int, np.integer)):
            domain = self.router_labels[domain_idx]
        else:
            domain = str(domain_idx)

        # Stage 2: Specialist
        if domain == "social":
            sess = self.social
            labels = SOCIAL_LABELS
        else:
            sess = self.business
            labels = BUSINESS_LABELS

        spec_inputs = {sess.get_inputs()[0].name: X}
        spec_outputs = sess.run(None, spec_inputs)
        
        intent_idx = spec_outputs[0][0]
        
        # Map intent index to string if numeric
        if isinstance(intent_idx, (int, np.integer)) and intent_idx < len(labels):
            intent = labels[intent_idx]
        else:
            intent = str(intent_idx)
        
        # Confidence logic for ONNX LinearSVC
        # Output 0 is Label, Output 1 is Probabilities/Scores
        confidence = 1.0
        if len(spec_outputs) > 1:
            scores = spec_outputs[1][0]
            # Normalize scores if they are not probabilities
            if isinstance(scores, dict): # Classifier with probas
                confidence = round(float(max(scores.values())), 4)
            else: # raw decision scores
                confidence = round(float(np.max(scores)), 4)

        return ClassificationResult(
            domain=domain,
            intent=intent,
            confidence=confidence,
        )
