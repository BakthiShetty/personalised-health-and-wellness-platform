from flask import Flask, request, jsonify
import json
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import MySQLdb.cursors
import hashlib
from flask_socketio import SocketIO, emit
from datetime import datetime  # Add this with other imports

app = Flask(__name__)
CORS(app)  # Allows frontend to make requests
socketio = SocketIO(app, cors_allowed_origins="*")  

# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'passwd': 'Bakthi@31',
    'db': 'loginsystem',
    'cursorclass': MySQLdb.cursors.DictCursor
}

def get_db_connection():
    return MySQLdb.connect(**db_config)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data['username']
        email = data['email']
        password = hashlib.sha1((data['password'] + "secret_key").encode()).hexdigest()
        
        # New fields
        age = data.get('age', None)
        gender = data.get('gender', None)
        height = data.get('height', None)
        weight = data.get('weight', None)

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
                existing_user = cursor.fetchone()

                if existing_user:
                    return jsonify({"error": "Username already exists"}), 400

                cursor.execute("""
                    INSERT INTO users (username, password, email, age, gender, height, weight) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (username, password, email, age, gender, height, weight))
                
                connection.commit()
                return jsonify({"message": "User registered successfully"}), 201
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data['username']
        password = hashlib.sha1((data['password'] + "secret_key").encode()).hexdigest()

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, username FROM users WHERE username = %s AND password = %s", 
                             (username, password))
                user = cursor.fetchone()

                if user:
                    return jsonify({
                        "message": "Login Successful",
                        "username": user['username'],
                        "user_id": user['id']
                    })
                else:
                    return jsonify({"error": "Invalid credentials"}), 401
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route('/health/<username>', methods=['GET'])
def get_health_data_by_username(username):
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM health_data 
                    WHERE user_id = (SELECT id FROM users WHERE username = %s)
                """, (username,))
                health_data = cursor.fetchone()

                if health_data:
                    return jsonify(health_data)
                else:
                    return jsonify({"error": "Health data not found"}), 404
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in get_health_data_by_username: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route('/health_data', methods=['POST'])
def add_health_data():
    try:
        data = request.json
        print("Received data:", data)  # Debug logging
        
        required_fields = ['user_id', 'heart_rate', 'steps', 'calories_burned', 
                         'sleep_hours', 'meal_type', 'calories_consumed', 'date']
        
        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing_fields
            }), 400

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # Verify user exists
                cursor.execute("SELECT id FROM users WHERE id = %s", (data['user_id'],))
                if not cursor.fetchone():
                    return jsonify({"error": "User not found"}), 404

                query = """
                    INSERT INTO health_data 
                    (user_id, heart_rate, steps, calories_burned, sleep_hours, 
                     meal_type, calories_consumed, date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    data['user_id'],
                    int(data['heart_rate']),
                    int(data['steps']),
                    float(data['calories_burned']),
                    float(data['sleep_hours']),
                    str(data['meal_type']),
                    float(data['calories_consumed']),
                    str(data['date'])  # Ensure date is string format
                )
                
                cursor.execute(query, values)
                connection.commit()

                # Add notifications if conditions met
                if int(data['heart_rate']) > 100:
                    create_notification(data['user_id'], 
                                      "⚠️ High heart rate recorded! Consider resting.")
                if int(data['steps']) < 3000:
                    create_notification(data['user_id'],
                                      "🚶‍♂️ You're below your step target. Time for a walk?")
                if float(data['sleep_hours']) < 7:
                    create_notification(data['user_id'],
                                     "😴 Low sleep detected! Aim for 7-9 hours for better health.")

                return jsonify({
                    "message": "Health data added successfully",
                    "inserted_id": cursor.lastrowid
                }), 201

        except MySQLdb.Error as db_err:
            print("Database error:", db_err)
            return jsonify({
                "error": "Database operation failed",
                "details": str(db_err)
            }), 500
            
        finally:
            connection.close()

    except Exception as e:
        print(f"Error in add_health_data: {str(e)}")
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

@app.route('/get_health_data', methods=['GET'])
def get_health_data_by_user_id():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM health_data 
                    WHERE user_id = %s 
                    ORDER BY date DESC
                """, (user_id,))
                health_data = cursor.fetchall()
                
                return jsonify({"health_data": health_data}), 200
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in get_health_data_by_user_id: {str(e)}")
        return jsonify({"error": "Server error"}), 500

# Goals Endpoints
@app.route('/goals', methods=['POST'])
def create_goal():
    try:
        data = request.json
        required_fields = ['user_id', 'goal_type', 'target_value', 'start_date', 'end_date']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                query = """
                    INSERT INTO goals 
                    (user_id, goal_type, target_value, current_value, start_date, end_date, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    data['user_id'],
                    data['goal_type'],
                    data['target_value'],
                    data.get('current_value', 0),
                    data['start_date'],
                    data['end_date'],
                    'ACTIVE'
                )
                
                cursor.execute(query, values)
                connection.commit()
                return jsonify({
                    "message": "Goal created successfully",
                    "goal_id": cursor.lastrowid
                }), 201
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in create_goal: {str(e)}")
        return jsonify({"error": "Server error"}), 500

# Fix 1: Enhanced update_goal endpoint
@app.route('/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    try:
        data = request.json
        current_value = float(data['current_value'])
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Get existing goal data
            cursor.execute("""
                SELECT target_value, end_date 
                FROM goals 
                WHERE goal_id = %s
            """, (goal_id,))
            goal = cursor.fetchone()
            
            if not goal:
                return jsonify({"error": "Goal not found"}), 404

            target_value = float(goal['target_value'])
            end_date = goal['end_date']
            today = datetime.now().date()
            
            # Determine status
            if current_value >= target_value:
                new_status = 'COMPLETED'
            elif end_date < today:
                new_status = 'FAILED'
            else:
                new_status = 'ACTIVE'

            # Update with new status
            cursor.execute("""
                UPDATE goals 
                SET current_value = %s,
                    status = %s
                WHERE goal_id = %s
            """, (current_value, new_status, goal_id))
            
            connection.commit()
            
            return jsonify({"message": "Goal updated successfully"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Server error"}), 500

# Fix 2: Add status check in get_user_goals
@app.route('/goals/<int:user_id>', methods=['GET'])
def get_user_goals(user_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Get goals and auto-update expired status
            cursor.execute("""
                UPDATE goals
                SET status = 'FAILED'
                WHERE user_id = %s 
                AND end_date < CURDATE() 
                AND status != 'COMPLETED'
            """, (user_id,))
            
            cursor.execute("""
                SELECT * FROM goals 
                WHERE user_id = %s
                ORDER BY end_date ASC
            """, (user_id,))
            
            goals = cursor.fetchall()
            connection.commit()
            return jsonify({"goals": goals}), 200
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route('/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM goals WHERE goal_id = %s", (goal_id,))
                connection.commit()
                
                if cursor.rowcount == 0:
                    return jsonify({"error": "Goal not found"}), 404
                    
                return jsonify({"message": "Goal deleted successfully"}), 200
        finally:
            connection.close()
    except Exception as e:
        print(f"Error in delete_goal: {str(e)}")
        return jsonify({"error": "Server error"}), 500
@app.route('/generate_recommendations/<int:user_id>', methods=['GET'])
def generate_recommendations(user_id):
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # Fetch health data for the user
                cursor.execute(""" 
                    SELECT * FROM health_data WHERE user_id = %s ORDER BY date DESC LIMIT 1
                """, (user_id,))
                health_data = cursor.fetchone()

                # Fetch user goals
                cursor.execute(""" 
                    SELECT * FROM goals WHERE user_id = %s AND status = 'ACTIVE'
                """, (user_id,))
                goals = cursor.fetchall()

                # Initialize recommendations list
                recommendations = []

                if health_data:
                    # Health Data Analysis

                    # BMI Calculation: BMI = weight / (height in meters)^2
                    if health_data.get('height') and health_data.get('weight'):
                        height_m = health_data['height'] / 100  # Assuming height is in cm, convert to meters
                        weight_kg = health_data['weight']
                        bmi = weight_kg / (height_m ** 2)
                        recommendations.append(f"Your BMI is {bmi:.2f}.")
                        if bmi < 18.5:
                            recommendations.append("You are underweight. Consider a balanced diet and consult with a nutritionist.")
                        elif 18.5 <= bmi < 24.9:
                            recommendations.append("Your weight is within the healthy range. Keep up the good work!")
                        elif 25 <= bmi < 29.9:
                            recommendations.append("You are overweight. Consider a weight loss plan and exercise regularly.")
                        else:
                            recommendations.append("You are obese. It's important to focus on weight loss through diet and exercise.")

                    # Heart rate recommendation
                    if health_data['heart_rate'] > 100:
                        recommendations.append("Consider consulting a doctor for high heart rate.")

                    # Step count recommendation
                    if health_data['steps'] < 5000:
                        recommendations.append("Try to walk at least 10,000 steps a day for better fitness.")

                    # Sleep recommendation
                    if health_data['sleep_hours'] < 7:
                        recommendations.append("Try to get at least 7-8 hours of sleep each night for better health.")

                    # Calories consumed recommendation
                    if health_data['calories_consumed'] > 2500:
                        recommendations.append("You may want to reduce your calorie intake to maintain a healthy weight.")

                # Goal-based Recommendations:
                if goals:
                    for goal in goals:
                        if goal['goal_type'] == 'WEIGHT_LOSS' and health_data['calories_consumed'] > 2500:
                            recommendations.append(f"To reach your weight loss goal, consider reducing your calorie intake below {goal['target_value']} calories.")

                        if goal['goal_type'] == 'FITNESS' and health_data['steps'] < 10000:
                            recommendations.append(f"To meet your fitness goal, try walking at least 10,000 steps a day.")

                        if goal['goal_type'] == 'SLEEP' and health_data['sleep_hours'] < 7:
                            recommendations.append(f"To improve your sleep goal, aim for at least 7-8 hours of sleep each night.")

                if not recommendations:
                    recommendations.append("You're on track! Keep up the good work.")

                # Insert recommendations into the database
                for recommendation in recommendations:
                    cursor.execute("""
                        INSERT INTO recommendations (user_id, recommendation_text, goal_type) 
                        VALUES (%s, %s, %s)
                    """, (user_id, recommendation, 'OTHER'))  # Default goal_type set to 'OTHER'
                
                connection.commit()
                

                return jsonify({"recommendations": recommendations}), 200

        finally:
            connection.close()
    except Exception as e:
        print(f"Error in generate_recommendations: {str(e)}")
        return jsonify({"error": "Server error"}), 500
@app.route('/get_report', methods=['GET'])
def get_report():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Fetch user details
            cursor.execute("""
                SELECT username, age, gender, height, weight FROM users WHERE id = %s
            """, (user_id,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Calculate BMI
            bmi = round(user['weight'] / ((user['height'] / 100) ** 2), 2) if user['height'] else None

            # Fetch health data (last 10 records)
            cursor.execute("""
                SELECT heart_rate, steps, calories_burned, sleep_hours, date 
                FROM health_data WHERE user_id = %s ORDER BY date DESC LIMIT 10
            """, (user_id,))
            health_records = cursor.fetchall()

            # Fetch goals data
            cursor.execute("""
                SELECT goal_type, target_value, current_value, start_date, end_date, status 
                FROM goals WHERE user_id = %s ORDER BY start_date DESC
            """, (user_id,))
            goals = cursor.fetchall()

        connection.close()

        # Format data for frontend
        report_data = {
            "user_info": {
                "username": user["username"],
                "age": user["age"],
                "gender": user["gender"],
                "height": user["height"],
                "weight": user["weight"],
                "bmi": bmi
            },
            "health_data": {
                "labels": [record["date"].strftime("%Y-%m-%d") for record in health_records],
                "heart_rate": [record["heart_rate"] for record in health_records],
                "steps": [record["steps"] for record in health_records],
                "calories_burned": [record["calories_burned"] for record in health_records],
                "sleep_hours": [record["sleep_hours"] for record in health_records]
            },
            "goals": goals
        }

        return jsonify(report_data), 200

    except Exception as e:
        print(f"Error in get_report: {str(e)}")
        return jsonify({"error": "Server error"}), 500

# ===== Add these new endpoints ===== (Add anywhere with your other routes)
@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM notifications 
                WHERE user_id = %s 
                ORDER BY created_at DESC
                LIMIT 20
            """, (user_id,))
            notifications = cursor.fetchall()
            return jsonify({"notifications": notifications}), 200
    except Exception as e:
        print(f"Error in get_notifications: {str(e)}")
        return jsonify({"error": "Server error"}), 500
    finally:
        connection.close()

@app.route('/notifications/mark_read/<int:notification_id>', methods=['PUT'])
def mark_notification_read(notification_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = %s
            """, (notification_id,))
            connection.commit()
            return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        print(f"Error in mark_notification_read: {str(e)}")
        return jsonify({"error": "Server error"}), 500
    finally:
        connection.close()

# ===== Add this helper function ===== (Add near your other helper functions)
def create_notification(user_id, message):
    """Helper to create notifications"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO notifications (user_id, message)
                VALUES (%s, %s)
            """, (user_id, message))
            connection.commit()
            
            # Send real-time update
            socketio.emit('new_notification', {
                'user_id': user_id,
                'message': message,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M")
            })
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
    finally:
        connection.close()

if __name__ == "__main__":
    app.run(debug=True)