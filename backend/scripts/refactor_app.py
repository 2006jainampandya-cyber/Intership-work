import re

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace('from database import db, PredictionRecord', 'from database import db, PredictionRecord, Patient, Technician')
content = content.replace('from database import User', 'from database import Patient, Technician')

# 2. Update token_required
token_new = '''def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'error': 'Authentication token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            role = data.get('role', 'patient')
            if role == 'technician':
                current_user = Technician.query.filter_by(id=data['user_id']).first()
            else:
                current_user = Patient.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
            current_user.role = role
            if role == 'patient':
                current_user.patient_id = current_user.patient_id
            else:
                current_user.patient_id = current_user.employee_id
        except Exception as e:
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated'''
content = re.sub(r'def token_required\(f\):.*?return decorated', token_new, content, flags=re.DOTALL)

# 3. Update Register
reg_new = '''def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400
        
    role = data.get('role', 'patient')
    
    if role == 'technician':
        if Technician.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        last_user = Technician.query.order_by(Technician.id.desc()).first()
        last_seq = last_user.id if last_user else 0
        new_id = f"EMP-{datetime.datetime.now().year}-{str(last_seq + 1).zfill(5)}"
        
        new_user = Technician(
            employee_id=new_id,
            name=data['name'],
            email=data['email'],
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            nickname=data.get('nickname'),
            mobile=data.get('mobile')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'patient_id': new_id}), 201
    else:
        if Patient.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        prefix = f"PNE-{datetime.datetime.now().year}"
        last_user = Patient.query.filter(Patient.patient_id.like(f"{prefix}%")).order_by(Patient.patient_id.desc()).first()
        last_seq = 0
        if last_user and last_user.patient_id:
            try:
                last_seq = int(last_user.patient_id.split('-')[2])
            except:
                pass
        new_patient_id = f"{prefix}-{str(last_seq + 1).zfill(6)}"
        
        new_user = Patient(
            patient_id=new_patient_id,
            name=data['name'],
            email=data['email'],
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            nickname=data.get('nickname'),
            age=data.get('age'),
            mobile=data.get('mobile')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'patient_id': new_patient_id}), 201'''
content = re.sub(r'def register\(\):.*?return jsonify\([^)]+\), 201', reg_new, content, flags=re.DOTALL)

# 4. Update Login
login_new = '''def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400
        
    user = Patient.query.filter_by(email=data['email']).first()
    role = 'patient'
    if not user:
        user = Technician.query.filter_by(email=data['email']).first()
        role = 'technician'
        
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'role': role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id, 
                'name': user.name, 
                'email': user.email, 
                'patient_id': user.employee_id if role == 'technician' else user.patient_id, 
                'role': role,
                'age': getattr(user, 'age', None),
                'mobile': user.mobile
            }
        }), 200
        
    return jsonify({'error': 'Invalid email or password'}), 401'''
content = re.sub(r'def login\(\):.*?return jsonify\(\{\'error\': \'Invalid email or password\'\}\), 401', login_new, content, flags=re.DOTALL)

# 5. Dashboard Patients
content = content.replace("users = User.query.filter_by(role='patient').all()", "users = Patient.query.all()")

# 6. Forgot Password
forgot_new = '''def forgot_password():
    data = request.get_json()
    
    user = Patient.query.filter_by(email=data['email']).first()
    if not user:
        user = Technician.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({'error': 'Account not found'}), 404
        
    if not user.nickname or user.nickname.lower() != data['nickname'].lower():
        return jsonify({'error': 'Incorrect security nickname'}), 401
        
    user.password_hash = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')
    db.session.commit()
    
    return jsonify({'message': 'Password reset successful'})'''
content = re.sub(r'def forgot_password\(\):.*?return jsonify\([^)]+\)[\n]+', forgot_new + '\n', content, flags=re.DOTALL)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Refactored app.py')
