# 한눈에 보기

저장장치는 Database 데이터를 지속적으로 보관하는 SSD나 HDD 같은 장치입니다.

Memory는 빠르지만 전원이 꺼지면 내용이 사라질 수 있습니다. Database는 table과 index 데이터를 저장장치에 보관하고, 자주 사용하는 일부를 Buffer Pool의 memory에 올려 사용합니다.

---

# Buffer Pool과의 관계

```text
데이터 요청
    ↓
Buffer Pool 확인
  ├─ 있음 → Memory에서 읽음
  └─ 없음 → 저장장치에서 읽어 Buffer Pool에 보관
```

Query를 실행한다고 항상 저장장치를 읽는 것은 아닙니다. 필요한 데이터가 Buffer Pool에 있으면 저장장치 접근 없이 처리할 수 있습니다.

반대로 처음 읽는 데이터나 Buffer Pool에서 빠진 데이터는 저장장치에서 가져와야 하므로 더 느릴 수 있습니다.

---

# 개발자가 개입하는 지점

애플리케이션 개발자가 Database 저장장치를 직접 읽고 쓰는 지점은 없습니다. SQL과 Database Driver를 통해 작업을 요청합니다.

그럼에도 저장장치를 알아야 하는 이유는 Buffer Pool에 데이터가 없을 때 실제 읽기 시간이 query 성능에 영향을 주기 때문입니다. 같은 query의 첫 실행과 반복 실행 시간이 다른 원인을 이해하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## Table과 저장장치는 같은 개념이 아닙니다

Table과 Index는 데이터를 구성하고 찾기 위한 논리적 구조입니다. 저장장치는 그 데이터를 실제로 보관하는 물리적인 공간입니다.

## 저장장치가 빠르면 모든 Query가 빨라지는 것은 아닙니다

잘못된 Execution Plan, 많은 데이터 처리, lock 대기나 CPU 작업이 병목이라면 저장장치만 빨라져도 문제가 해결되지 않습니다.

## 저장장치에 있는 데이터도 Memory Cache의 영향을 받습니다

Database Buffer Pool 외에도 운영체제가 별도의 file cache를 사용할 수 있습니다. 그래서 완전히 cache가 없는 성능을 반복해서 만드는 일은 생각보다 어렵습니다.

---

# 참고 자료

- [MySQL — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)
- [MySQL — InnoDB Disk I/O](https://dev.mysql.com/doc/refman/8.4/en/innodb-disk-io.html)
