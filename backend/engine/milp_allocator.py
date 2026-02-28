import pulp

def run_allocation(patients: list, beds: list):
    """
    patients: list of dicts [{"id": "P1", "triage_level": "Red", "acuity_score": 90, "wait_time_mins": 15}]
    beds: list of dicts [{"id": "B1", "ward_id": "W1", "bed_type": "ICU"}]
    
    Returns: dict mapping patient_id to assigned bed_id, and objective value
    """
    if not patients or not beds:
        return {}, 0.0

    # 1. Initialize Problem
    prob = pulp.LpProblem("Bed_Allocation", pulp.LpMaximize)

    # 2. Decision Variables
    # x[p][b] = 1 if patient p is assigned to bed b, 0 otherwise
    x = pulp.LpVariable.dicts("assign",
                              ((p['id'], b['id']) for p in patients for b in beds),
                              cat='Binary')

    # 3. Objective Function
    # Maximize survival probability (acuity_score match) and minimize wait time penalization
    # Assuming high acuity score means higher priority.
    objective_terms = []
    for p in patients:
        for b in beds:
            # Base score matching priority
            score = p['acuity_score']
            
            # Bonus for matching appropriate bed type
            if p['triage_level'] == 'Red' and b['bed_type'] in ['ICU', 'Step-Down']:
                score += 50
            elif p['triage_level'] == 'Yellow' and b['bed_type'] in ['General', 'Step-Down']:
                score += 30
            elif p['triage_level'] == 'Green' and b['bed_type'] == 'General':
                score += 20
            else:
                score -= 100 # Penalty for mismatch
                
            # Bonus for prioritizing those who waited longer
            score += p.get('wait_time_mins', 0) * 0.5
            
            objective_terms.append(score * x[(p['id'], b['id'])])

    prob += pulp.lpSum(objective_terms)

    # 4. Constraints
    # A patient can be assigned to at most 1 bed
    for p in patients:
        prob += pulp.lpSum([x[(p['id'], b['id'])] for b in beds]) <= 1

    # A bed can have at most 1 patient
    for b in beds:
        prob += pulp.lpSum([x[(p['id'], b['id'])] for p in patients]) <= 1

    # Hard constraints: Red triage must not go to General if ICU/Step-Down available
    # For a real hackathon, keep it simple: just let the objective weights handle it, 
    # but strictly prevent highly inappropriate assignments.
    for p in patients:
        for b in beds:
            if p['triage_level'] == 'Red' and b['bed_type'] == 'General':
                prob += x[(p['id'], b['id'])] == 0

    # 5. Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    # 6. Extract Results
    assignments = {}
    for p in patients:
        for b in beds:
            if pulp.value(x[(p['id'], b['id'])]) == 1:
                assignments[p['id']] = b['id']

    return assignments, pulp.value(prob.objective)
